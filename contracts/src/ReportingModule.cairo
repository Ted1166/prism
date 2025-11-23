use starknet::ContractAddress;

#[starknet::interface]
trait ICredentialRegistryDispatcher<TContractState> {
    fn verify_credential_ownership(
        self: @TContractState,
        credential_id: u256,
        claimed_owner: ContractAddress
    ) -> bool;
    
    fn get_credential_status(
        self: @TContractState,
        credential_id: u256
    ) -> u8;
}

#[starknet::interface]
trait IReportingModule<TContractState> {
    fn submit_anonymous_report(
        ref self: TContractState,
        report_hash: felt252,
        credential_proof: Array<felt252>,
        evidence_uri: felt252,
        company_category: felt252,
        severity: u8
    ) -> u256;
    
    fn verify_report(
        ref self: TContractState,
        report_id: u256,
        verification_proof: Array<felt252>
    );
    
    fn claim_reward(
        ref self: TContractState,
        report_id: u256,
        zcash_address: felt252,
        claim_proof: Array<felt252>
    );
    
    fn get_report_status(
        self: @TContractState,
        report_id: u256
    ) -> u8;
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct Report {
    id: u256,
    report_hash: felt252,
    evidence_uri: felt252,
    credential_commitment: felt252,
    company_category: felt252,
    severity: u8,
    timestamp: u64,
    verification_count: u8,
    verified: bool,
    reward_claimed: bool,
    reward_amount: u256,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct Verification {
    report_id: u256,
    verifier_commitment: felt252,
    timestamp: u64,
    verdict: bool,
}

#[starknet::contract]
mod ReportingModule {
    use super::{Report, Verification, ContractAddress, ICredentialRegistryDispatcher};
    use starknet::get_block_timestamp;
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Map, StoragePathEntry
    };

    #[storage]
    struct Storage {
        reports: Map<u256, Report>,
        report_counter: u256,
        verifications: Map<(u256, u8), Verification>,
        claim_nullifiers: Map<felt252, bool>,
        report_nullifiers: Map<felt252, bool>,
        verification_engine: ContractAddress,
        min_verifications_required: u8,
        base_reward: u256,
        reward_pool_balance: u256,
        credential_registry: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ReportSubmitted: ReportSubmitted,
        ReportVerified: ReportVerified,
        RewardClaimed: RewardClaimed,
    }

    #[derive(Drop, starknet::Event)]
    struct ReportSubmitted {
        #[key]
        report_id: u256,
        company_category: felt252,
        severity: u8,
        timestamp: u64,
        reward_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct ReportVerified {
        #[key]
        report_id: u256,
        verification_count: u8,
        verified: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct RewardClaimed {
        #[key]
        report_id: u256,
        zcash_address: felt252,
        reward_amount: u256,
        timestamp: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        verification_engine: ContractAddress,
        credential_registry: ContractAddress,
        min_verifications: u8,
        base_reward: u256
    ) {
        self.verification_engine.write(verification_engine);
        self.credential_registry.write(credential_registry);
        self.min_verifications_required.write(min_verifications);
        self.base_reward.write(base_reward);
        self.report_counter.write(0);
        self.reward_pool_balance.write(0);
    }

    #[abi(embed_v0)]
    impl ReportingModuleImpl of super::IReportingModule<ContractState> {
        fn submit_anonymous_report(
            ref self: ContractState,
            report_hash: felt252,
            credential_proof: Array<felt252>,
            evidence_uri: felt252,
            company_category: felt252,
            severity: u8
        ) -> u256 {
            assert(severity >= 1 && severity <= 5, 'Invalid severity');
            assert(credential_proof.len() >= 3, 'Invalid proof');
            assert(credential_proof.len() >= 3, 'Proof requires credential ID');
            let credential_id_felt = *credential_proof.at(2);
            assert(credential_id_felt != 0, 'Invalid credential ID');

            let nullifier = *credential_proof.at(0);
            assert(!self.report_nullifiers.entry(nullifier).read(), 'Already reported');
            self.report_nullifiers.entry(nullifier).write(true);
            
            let credential_commitment = *credential_proof.at(1);
            
            let report_id = self.report_counter.read() + 1;
            self.report_counter.write(report_id);
            
            let reward_amount = self._calculate_reward(severity);
            
            let report = Report {
                id: report_id,
                report_hash,
                evidence_uri,
                credential_commitment,
                company_category,
                severity,
                timestamp: get_block_timestamp(),
                verification_count: 0,
                verified: false,
                reward_claimed: false,
                reward_amount,
            };
            
            self.reports.entry(report_id).write(report);
            
            self.emit(ReportSubmitted {
                report_id,
                company_category,
                severity,
                timestamp: get_block_timestamp(),
                reward_amount,
            });
            
            report_id
        }
        
        fn verify_report(
            ref self: ContractState,
            report_id: u256,
            verification_proof: Array<felt252>
        ) {
            let mut report = self.reports.entry(report_id).read();
            assert(report.id != 0, 'Report not found');
            assert(!report.verified, 'Already verified');
            assert(verification_proof.len() >= 2, 'Invalid verifier proof'); 
            
            let verifier_commitment = *verification_proof.at(0);
            let _verifier_credential_type = *verification_proof.at(1);

            assert(verifier_commitment != 0, 'Invalid verifier');
            
            let verification = Verification {
                report_id,
                verifier_commitment,
                timestamp: get_block_timestamp(),
                verdict: true,
            };
            
            let verification_index = report.verification_count;
            self.verifications.entry((report_id, verification_index)).write(verification);
            
            report.verification_count += 1;
            
            if report.verification_count >= self.min_verifications_required.read() {
                report.verified = true;
            }
            
            self.reports.entry(report_id).write(report);
            
            self.emit(ReportVerified {
                report_id,
                verification_count: report.verification_count,
                verified: report.verified,
            });
        }
        
        fn claim_reward(
            ref self: ContractState,
            report_id: u256,
            zcash_address: felt252,
            claim_proof: Array<felt252>
        ) {
            let mut report = self.reports.entry(report_id).read();
            
            assert(report.id != 0, 'Report not found');
            assert(report.verified, 'Report not verified');
            assert(!report.reward_claimed, 'Reward already claimed');
            assert(claim_proof.len() >= 2, 'Invalid claim proof');
            
            let pool_balance = self.reward_pool_balance.read();
            assert(pool_balance >= report.reward_amount, 'Insufficient pool balance');

            self.reward_pool_balance.write(pool_balance - report.reward_amount);
            
            let claimed_commitment = *claim_proof.at(0);
            assert(
                claimed_commitment == report.credential_commitment,
                'Invalid claimer'
            );
            
            let claim_nullifier = *claim_proof.at(1);
            assert(
                !self.claim_nullifiers.entry(claim_nullifier).read(),
                'Already claimed with this proof'
            );
            self.claim_nullifiers.entry(claim_nullifier).write(true);
            
            report.reward_claimed = true;
            self.reports.entry(report_id).write(report);
            
            self.emit(RewardClaimed {
                report_id,
                zcash_address,
                reward_amount: report.reward_amount,
                timestamp: get_block_timestamp(),
            });
        }
        
        fn get_report_status(
            self: @ContractState,
            report_id: u256
        ) -> u8 {
            let report = self.reports.entry(report_id).read();
            
            if report.id == 0 {
                return 0; 
            }
            
            if report.reward_claimed {
                return 3; 
            }
            
            if report.verified {
                return 2; 
            }
            
            1 
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _calculate_reward(
            self: @ContractState,
            severity: u8
        ) -> u256 {
            let base = self.base_reward.read();
            let multiplier: u256 = severity.into();
            base * multiplier
        }
    }

    #[external(v0)]
    fn get_report(
        self: @ContractState,
        report_id: u256
    ) -> Report {
        self.reports.entry(report_id).read()
    }
    
    #[external(v0)]
    fn get_verification(
        self: @ContractState,
        report_id: u256,
        verification_index: u8
    ) -> Verification {
        self.verifications.entry((report_id, verification_index)).read()
    }
    
    #[external(v0)]
    fn get_total_reports(self: @ContractState) -> u256 {
        self.report_counter.read()
    }
    
    #[external(v0)]
    fn get_reward_pool_balance(self: @ContractState) -> u256 {
        self.reward_pool_balance.read()
    }
    
    #[external(v0)]
    fn update_min_verifications(
        ref self: ContractState,
        new_min: u8
    ) {
        self.min_verifications_required.write(new_min);
    }

    #[external(v0)]
    fn fund_reward_pool(ref self: ContractState, amount: u256) {
        let current_balance = self.reward_pool_balance.read();
        self.reward_pool_balance.write(current_balance + amount);
    }
}