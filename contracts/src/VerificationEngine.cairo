use starknet::ContractAddress;

#[starknet::interface]
trait IVerificationEngine<TContractState> {
    fn verify_employment_proof(
        ref self: TContractState,
        credential_id: u256,
        merkle_proof: Array<felt252>,
        company_category: felt252,
        role_level: u8
    ) -> bool;
    
    fn verify_skill_level_proof(
        ref self: TContractState,
        credential_id: u256,
        proof: Array<felt252>,
        minimum_level: u8
    ) -> bool;
    
    fn verify_experience_proof(
        ref self: TContractState,
        credential_id: u256,
        proof: Array<felt252>,
        minimum_years: u8
    ) -> bool;
    
    fn create_verification_request(
        ref self: TContractState,
        credential_type: felt252,
        min_level: u8,
        min_years: u8
    ) -> u256;
    
    fn fulfill_verification_request(
        ref self: TContractState,
        request_id: u256,
        credential_id: u256,
        proof: Array<felt252>
    ) -> bool;
    
    fn get_verifier_reputation(
        self: @TContractState,
        verifier: ContractAddress
    ) -> u64;
    
    fn register_company_merkle_root(
        ref self: TContractState,
        company_category: felt252,
        merkle_root: felt252
    );
    
    fn get_verification_request(
        self: @TContractState,
        request_id: u256
    ) -> VerificationRequest;
    
    fn get_verification_result(
        self: @TContractState,
        result_id: u256
    ) -> VerificationResult;
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct VerificationRequest {
    id: u256,
    requester: ContractAddress,
    credential_type: felt252,
    min_level: u8,
    min_years: u8,
    timestamp: u64,
    fulfilled: bool,
    fulfiller: ContractAddress,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct VerificationResult {
    request_id: u256,
    credential_id: u256,
    verifier: ContractAddress,
    verified: bool,
    timestamp: u64,
}

#[starknet::contract]
mod VerificationEngine {
    use super::{VerificationRequest, VerificationResult, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Map, StoragePathEntry
    };
    use core::poseidon::poseidon_hash_span;

    #[storage]
    struct Storage {
        credential_registry: ContractAddress,
        verification_requests: Map<u256, VerificationRequest>,
        verification_results: Map<u256, VerificationResult>,
        request_counter: u256,
        result_counter: u256,
        verifier_reputation: Map<ContractAddress, u64>,
        company_merkle_roots: Map<felt252, felt252>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        VerificationRequested: VerificationRequested,
        VerificationFulfilled: VerificationFulfilled,
        ProofVerified: ProofVerified,
        ReputationUpdated: ReputationUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct VerificationRequested {
        #[key]
        request_id: u256,
        #[key]
        requester: ContractAddress,
        credential_type: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct VerificationFulfilled {
        #[key]
        request_id: u256,
        #[key]
        fulfiller: ContractAddress,
        verified: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct ProofVerified {
        #[key]
        credential_id: u256,
        proof_type: felt252,
        #[key]
        verifier: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct ReputationUpdated {
        #[key]
        verifier: ContractAddress,
        new_reputation: u64,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        credential_registry: ContractAddress
    ) {
        self.credential_registry.write(credential_registry);
        self.request_counter.write(0);
        self.result_counter.write(0);
    }

    #[abi(embed_v0)]
    impl VerificationEngineImpl of super::IVerificationEngine<ContractState> {
        fn verify_employment_proof(
            ref self: ContractState,
            credential_id: u256,
            merkle_proof: Array<felt252>,
            company_category: felt252,
            role_level: u8
        ) -> bool {
            let caller = get_caller_address();
            
            let merkle_root = self.company_merkle_roots.entry(company_category).read();
            assert(merkle_root != 0, 'Company not registered');
            
            let leaf = *merkle_proof.at(0); 
            let verified = self._verify_merkle_proof(
                leaf,
                merkle_root,
                merkle_proof
            );
            
            if verified {
                let current_rep = self.verifier_reputation.entry(caller).read();
                self.verifier_reputation.entry(caller).write(current_rep + 1);
                
                self.emit(ProofVerified {
                    credential_id,
                    proof_type: 'employment',
                    verifier: caller,
                });
                
                self.emit(ReputationUpdated {
                    verifier: caller,
                    new_reputation: current_rep + 1,
                });
            }
            
            verified
        }
        
        fn verify_skill_level_proof(
            ref self: ContractState,
            credential_id: u256,
            proof: Array<felt252>,
            minimum_level: u8
        ) -> bool {            
            let caller = get_caller_address();
            
            let verified = self._verify_range_proof(
                credential_id,
                proof,
                minimum_level
            );
            
            if verified {
                self.emit(ProofVerified {
                    credential_id,
                    proof_type: 'skill',
                    verifier: caller,
                });
            }
            
            verified
        }
        
        fn verify_experience_proof(
            ref self: ContractState,
            credential_id: u256,
            proof: Array<felt252>,
            minimum_years: u8
        ) -> bool {
            let caller = get_caller_address();
            
            let verified = self._verify_range_proof(
                credential_id,
                proof,
                minimum_years
            );
            
            if verified {
                self.emit(ProofVerified {
                    credential_id,
                    proof_type: 'experience',
                    verifier: caller,
                });
            }
            
            verified
        }
        
        fn create_verification_request(
            ref self: ContractState,
            credential_type: felt252,
            min_level: u8,
            min_years: u8
        ) -> u256 {
            let caller = get_caller_address();
            let request_id = self.request_counter.read() + 1;
            self.request_counter.write(request_id);
            
            let request = VerificationRequest {
                id: request_id,
                requester: caller,
                credential_type,
                min_level,
                min_years,
                timestamp: get_block_timestamp(),
                fulfilled: false,
                fulfiller: 0.try_into().unwrap(),
            };
            
            self.verification_requests.entry(request_id).write(request);
            
            self.emit(VerificationRequested {
                request_id,
                requester: caller,
                credential_type,
                timestamp: get_block_timestamp(),
            });
            
            request_id
        }
        
        fn fulfill_verification_request(
            ref self: ContractState,
            request_id: u256,
            credential_id: u256,
            proof: Array<felt252>
        ) -> bool {
            let caller = get_caller_address();
            let mut request = self.verification_requests.entry(request_id).read();
            
            assert(request.id != 0, 'Request not found');
            assert(!request.fulfilled, 'Already fulfilled');
            
            let verified = if request.credential_type == 'skill' {
                self.verify_skill_level_proof(
                    credential_id,
                    proof,
                    request.min_level
                )
            } else if request.credential_type == 'experience' {
                self.verify_experience_proof(
                    credential_id,
                    proof,
                    request.min_years
                )
            } else {
                false
            };
            
            if verified {
                request.fulfilled = true;
                request.fulfiller = caller;
                self.verification_requests.entry(request_id).write(request);
                
                let result_id = self.result_counter.read() + 1;
                self.result_counter.write(result_id);
                
                let result = VerificationResult {
                    request_id,
                    credential_id,
                    verifier: caller,
                    verified: true,
                    timestamp: get_block_timestamp(),
                };
                
                self.verification_results.entry(result_id).write(result);
                
                self.emit(VerificationFulfilled {
                    request_id,
                    fulfiller: caller,
                    verified: true,
                });
            }
            
            verified
        }
        
        fn get_verifier_reputation(
            self: @ContractState,
            verifier: ContractAddress
        ) -> u64 {
            self.verifier_reputation.entry(verifier).read()
        }
        
        fn register_company_merkle_root(
            ref self: ContractState,
            company_category: felt252,
            merkle_root: felt252
        ) {
            self.company_merkle_roots.entry(company_category).write(merkle_root);
        }
        
        fn get_verification_request(
            self: @ContractState,
            request_id: u256
        ) -> VerificationRequest {
            self.verification_requests.entry(request_id).read()
        }
        
        fn get_verification_result(
            self: @ContractState,
            result_id: u256
        ) -> VerificationResult {
            self.verification_results.entry(result_id).read()
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _verify_merkle_proof(
            self: @ContractState,
            leaf: felt252,
            root: felt252,
            proof: Array<felt252>
        ) -> bool {
            if proof.len() < 2 {
                return false;
            }
            
            let mut current_hash = leaf;
            let mut i: u32 = 1;
            
            loop {
                if i >= proof.len() {
                    break;
                }
                
                let sibling = *proof.at(i);
                
                let mut hash_input = ArrayTrait::new();
                hash_input.append(current_hash);
                hash_input.append(sibling);
                
                current_hash = poseidon_hash_span(hash_input.span());
                i += 1;
            };
            
            current_hash == root
        }
        
        fn _verify_range_proof(
            self: @ContractState,
            credential_id: u256,
            proof: Array<felt252>,
            threshold: u8
        ) -> bool {
            if proof.len() < 2 {
                return false;
            }
            credential_id > 0 && threshold > 0
        }
    }
}