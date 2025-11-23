use starknet::ContractAddress;

#[starknet::interface]
trait ICredentialRegistry<TContractState> {
    fn issue_credential(
        ref self: TContractState,
        recipient: ContractAddress,
        credential_type: felt252,
        credential_hash: felt252,
        metadata_uri: felt252,
        expiry_timestamp: u64
    ) -> u256;
    
    fn batch_issue_credentials(
        ref self: TContractState,
        recipients: Array<ContractAddress>,
        credential_type: felt252,
        credential_hashes: Array<felt252>,
        metadata_uris: Array<felt252>,
        expiry_timestamp: u64
    ) -> Array<u256>;
    
    fn verify_credential_ownership(
        self: @TContractState,
        credential_id: u256,
        claimed_owner: ContractAddress
    ) -> bool;
    
    fn revoke_credential(
        ref self: TContractState,
        credential_id: u256
    );
    
    fn get_credential(
        self: @TContractState,
        credential_id: u256
    ) -> Credential;
    
    fn get_credential_status(
        self: @TContractState,
        credential_id: u256
    ) -> u8;
    
    fn get_user_credential_count(
        self: @TContractState,
        user: ContractAddress
    ) -> u256;
    
    fn authorize_issuer(
        ref self: TContractState,
        issuer: ContractAddress,
        authorized: bool
    );
    
    fn is_authorized_issuer(
        self: @TContractState,
        issuer: ContractAddress
    ) -> bool;
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct Credential {
    id: u256,
    recipient: ContractAddress,
    issuer: ContractAddress,
    credential_type: felt252,  
    credential_hash: felt252,  
    metadata_uri: felt252,    
    issue_timestamp: u64,
    expiry_timestamp: u64,
    revoked: bool,
    verification_count: u64,
}

#[starknet::contract]
mod CredentialRegistry {
    use super::{Credential, ContractAddress};
    use starknet::{get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Map, StoragePathEntry
    };

    #[storage]
    struct Storage {
        credentials: Map<u256, Credential>,
        credential_counter: u256,
        authorized_issuers: Map<ContractAddress, bool>,
        owner: ContractAddress,
        user_credential_count: Map<ContractAddress, u256>,
        user_credentials: Map<(ContractAddress, u256), u256>,
        credential_owner: Map<u256, ContractAddress>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CredentialIssued: CredentialIssued,
        CredentialBatchIssued: CredentialBatchIssued,
        CredentialRevoked: CredentialRevoked,
        IssuerAuthorized: IssuerAuthorized,
        OwnershipTransferred: OwnershipTransferred,
    }

    #[derive(Drop, starknet::Event)]
    struct CredentialIssued {
        #[key]
        credential_id: u256,
        #[key]
        recipient: ContractAddress,
        #[key]
        issuer: ContractAddress,
        credential_type: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct CredentialBatchIssued {
        #[key]
        issuer: ContractAddress,
        count: u256,
        credential_type: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct CredentialRevoked {
        #[key]
        credential_id: u256,
        issuer: ContractAddress,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct IssuerAuthorized {
        #[key]
        issuer: ContractAddress,
        authorized: bool,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.credential_counter.write(0);
        self.authorized_issuers.entry(owner).write(true);
    }

    #[abi(embed_v0)]
    impl CredentialRegistryImpl of super::ICredentialRegistry<ContractState> {
        fn issue_credential(
            ref self: ContractState,
            recipient: ContractAddress,
            credential_type: felt252,
            credential_hash: felt252,
            metadata_uri: felt252,
            expiry_timestamp: u64
        ) -> u256 {
            let caller = get_caller_address();
            
            assert(self.authorized_issuers.entry(caller).read(), 'Unauthorized issuer');
            
            let current_time = get_block_timestamp();
            assert(expiry_timestamp > current_time, 'Invalid expiry time');
            
            let credential_id = self.credential_counter.read() + 1;
            self.credential_counter.write(credential_id);
            
            let credential = Credential {
                id: credential_id,
                recipient,
                issuer: caller,
                credential_type,
                credential_hash,
                metadata_uri,
                issue_timestamp: current_time,
                expiry_timestamp,
                revoked: false,
                verification_count: 0,
            };
            
            self.credentials.entry(credential_id).write(credential);
            self.credential_owner.entry(credential_id).write(recipient);
            
            let user_count = self.user_credential_count.entry(recipient).read();
            self.user_credentials.entry((recipient, user_count)).write(credential_id);
            self.user_credential_count.entry(recipient).write(user_count + 1);
            
            self.emit(CredentialIssued {
                credential_id,
                recipient,
                issuer: caller,
                credential_type,
                timestamp: current_time,
            });
            
            credential_id
        }
        
        fn batch_issue_credentials(
            ref self: ContractState,
            recipients: Array<ContractAddress>,
            credential_type: felt252,
            credential_hashes: Array<felt252>,
            metadata_uris: Array<felt252>,
            expiry_timestamp: u64
        ) -> Array<u256> {
            let caller = get_caller_address();
            assert(self.authorized_issuers.entry(caller).read(), 'Unauthorized issuer');
            
            let len = recipients.len();
            assert(len == credential_hashes.len(), 'Array length mismatch');
            assert(len == metadata_uris.len(), 'Array length mismatch');
            assert(len > 0, 'Empty batch');
            
            let mut credential_ids = ArrayTrait::new();
            let mut i: u32 = 0;
            
            loop {
                if i >= len {
                    break;
                }
                
                assert(i < recipients.len(), 'Index out of bounds');
                let recipient = *recipients.at(i);
                let hash = *credential_hashes.at(i);
                let uri = *metadata_uris.at(i);
                
                let credential_id = self.issue_credential(
                    recipient,
                    credential_type,
                    hash,
                    uri,
                    expiry_timestamp
                );
                
                credential_ids.append(credential_id);
                i += 1;
            };
            
            self.emit(CredentialBatchIssued {
                issuer: caller,
                count: len.into(),
                credential_type,
            });
            
            credential_ids
        }
        
        fn verify_credential_ownership(
            self: @ContractState,
            credential_id: u256,
            claimed_owner: ContractAddress
        ) -> bool {
            let actual_owner = self.credential_owner.entry(credential_id).read();
            actual_owner == claimed_owner
        }
        
        fn revoke_credential(
            ref self: ContractState,
            credential_id: u256
        ) {
            let caller = get_caller_address();
            let mut credential = self.credentials.entry(credential_id).read();
            
            assert(credential.id != 0, 'Credential not found');
            
            let is_issuer = credential.issuer == caller;
            let is_owner = self.owner.read() == caller;
            assert(is_issuer || is_owner, 'Unauthorized revocation');
            
            credential.revoked = true;
            self.credentials.entry(credential_id).write(credential);
            
            self.emit(CredentialRevoked {
                credential_id,
                issuer: caller,
                timestamp: get_block_timestamp(),
            });
        }
        
        fn get_credential(
            self: @ContractState,
            credential_id: u256
        ) -> Credential {
            self.credentials.entry(credential_id).read()
        }
        
        fn get_credential_status(
            self: @ContractState,
            credential_id: u256
        ) -> u8 {
            let credential = self.credentials.entry(credential_id).read();
            
            if credential.id == 0 {
                return 0; 
            }
            
            if credential.revoked {
                return 2; 
            }
            
            if get_block_timestamp() > credential.expiry_timestamp {
                return 1; 
            }
            
            3 
        }
        
        fn get_user_credential_count(
            self: @ContractState,
            user: ContractAddress
        ) -> u256 {
            self.user_credential_count.entry(user).read()
        }
        
        fn authorize_issuer(
            ref self: ContractState,
            issuer: ContractAddress,
            authorized: bool
        ) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Only owner');
            
            self.authorized_issuers.entry(issuer).write(authorized);
            
            self.emit(IssuerAuthorized {
                issuer,
                authorized,
            });
        }
        
        fn is_authorized_issuer(
            self: @ContractState,
            issuer: ContractAddress
        ) -> bool {
            self.authorized_issuers.entry(issuer).read()
        }
    }

    #[external(v0)]
    fn transfer_ownership(
        ref self: ContractState,
        new_owner: ContractAddress
    ) {
        let caller = get_caller_address();
        let current_owner = self.owner.read();
        assert(caller == current_owner, 'Only owner');
        
        self.owner.write(new_owner);

        self.authorized_issuers.entry(new_owner).write(true);
        
        self.emit(OwnershipTransferred {
            previous_owner: current_owner,
            new_owner,
        });
    }
    
    #[external(v0)]
    fn get_user_credentials(
        self: @ContractState,
        user: ContractAddress,
        offset: u256,
        limit: u256
    ) -> Array<u256> {
        let total_count = self.user_credential_count.entry(user).read();
        let mut credentials = ArrayTrait::new();
        
        let end = if offset + limit > total_count {
            total_count
        } else {
            offset + limit
        };
        
        let mut i = offset;
        loop {
            if i >= end {
                break;
            }
            let cred_id = self.user_credentials.entry((user, i)).read();
            credentials.append(cred_id);
            i += 1;
        };
        
        credentials
    }
    
    #[external(v0)]
    fn get_total_credentials(self: @ContractState) -> u256 {
        self.credential_counter.read()
    }
}
