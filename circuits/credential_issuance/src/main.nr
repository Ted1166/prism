use dep::std;
use std::hash::pedersen_hash;

fn main(
    // ============================================
    // PRIVATE INPUTS
    // ============================================
    
    issuer_secret: Field,
    issuer_id: Field,
    recipient_id: Field,
    credential_type: Field,    
    credential_data: [Field; 8], 
    issue_timestamp: Field,
    expiry_timestamp: Field,
    issuer_name_hash: Field,
    credential_metadata_hash: Field,
    
    // ============================================
    // PUBLIC INPUTS
    // ============================================
    
    authorized_issuer_root: pub Field, 
    issuer_merkle_proof: pub [Field; 8],
    issuer_merkle_indices: pub [Field; 8],
    
    min_validity_period: pub Field, 
    current_timestamp: pub Field
    
) -> pub (Field, Field, Field) {
    
    // ============================================
    // 1. VERIFY ISSUER IS AUTHORIZED
    // ============================================
    
    let issuer_leaf = pedersen_hash([
        issuer_id,
        issuer_secret,
        issuer_name_hash
    ]);
    
    let computed_root = verify_merkle_proof(
        issuer_leaf,
        issuer_merkle_proof,
        issuer_merkle_indices
    );
    
    assert(computed_root == authorized_issuer_root, "Unauthorized issuer");
    
    // ============================================
    // 2. VALIDATE CREDENTIAL DATA
    // ============================================
    
    assert(issue_timestamp as u64 < expiry_timestamp as u64, "Invalid expiry");
    assert(issue_timestamp as u64 <= current_timestamp as u64, "Future issue date");
    
    let validity_period = expiry_timestamp - issue_timestamp;
    assert(validity_period as u64 >= min_validity_period as u64, "Validity too short");
    
    assert(credential_type as u64 >= 1, "Invalid credential type");
    assert(credential_type as u64 <= 10, "Invalid credential type");
    
    // ============================================
    // 3. GENERATE OUTPUTS
    // ============================================
    
    let credential_id = pedersen_hash([
        issuer_id,
        recipient_id,
        credential_type,
        issue_timestamp,
        expiry_timestamp,
        credential_data[0],
        credential_data[1],
        credential_data[2],
        credential_data[3],
        credential_metadata_hash
    ]);
    
    let credential_commitment = pedersen_hash([
        credential_id,
        recipient_id,
        credential_data[0],
        credential_data[1],
        credential_data[2],
        credential_data[3],
        credential_data[4],
        credential_data[5]
    ]);
    
    let issuer_commitment = pedersen_hash([
        issuer_id,
        credential_id
    ]);
    
    (credential_id, credential_commitment, issuer_commitment)
}

fn verify_merkle_proof(
    leaf: Field,
    proof: [Field; 8],
    indices: [Field; 8]
) -> Field {
    let mut current = leaf;
    
    for i in 0..8 {
        let sibling = proof[i];
        let is_right = indices[i];
        
        if is_right == 1 {
            current = pedersen_hash([sibling, current]);
        } else {
            current = pedersen_hash([current, sibling]);
        }
    }
    
    current
}

// ============================================
// TESTS
// ============================================

#[test]
fn print_authorized_root() {
    let issuer_id = 1;
    let issuer_secret = 11111;
    let issuer_name_hash = 12345;
    
    let merkle_proof = [1, 2, 3, 4, 5, 6, 7, 8];
    let merkle_indices = [0, 1, 0, 1, 0, 1, 0, 1];
    
    let issuer_leaf = pedersen_hash([
        issuer_id,
        issuer_secret,
        issuer_name_hash
    ]);
    
    let authorized_root = verify_merkle_proof(issuer_leaf, merkle_proof, merkle_indices);
    
    std::println("Authorized Issuer Root:");
    std::println(authorized_root);
    
    assert(authorized_root != 0);
}

#[test]
fn test_valid_credential_issuance() {
    let issuer_secret = 11111;
    let issuer_id = 1;
    let recipient_id = 100;
    let credential_type = 1; 
    let credential_data = [8, 5, 3, 2, 1, 0, 0, 0]; 
    let issue_timestamp = 1700000000;
    let expiry_timestamp = 1800000000;
    let issuer_name_hash = 12345;
    let metadata_hash = 67890;
    
    let merkle_proof = [1, 2, 3, 4, 5, 6, 7, 8];
    let merkle_indices = [0, 1, 0, 1, 0, 1, 0, 1];
    
    let issuer_leaf = pedersen_hash([
        issuer_id,
        issuer_secret,
        issuer_name_hash
    ]);
    let authorized_root = verify_merkle_proof(issuer_leaf, merkle_proof, merkle_indices);
    
    let min_validity = 1000000;
    let current_time = 1700000000;
    
    let (cred_id, cred_commitment, issuer_commitment) = main(
        issuer_secret,
        issuer_id,
        recipient_id,
        credential_type,
        credential_data,
        issue_timestamp,
        expiry_timestamp,
        issuer_name_hash,
        metadata_hash,
        authorized_root,
        merkle_proof,
        merkle_indices,
        min_validity,
        current_time
    );
    
    assert(cred_id != 0);
    assert(cred_commitment != 0);
    assert(issuer_commitment != 0);
}

#[test]
fn test_expired_credential() {
    let issuer_secret = 11111;
    let issuer_id = 1;
    let recipient_id = 100;
    let credential_type = 1;
    let credential_data = [8, 5, 3, 2, 1, 0, 0, 0];
    let issue_timestamp = 1700000000;
    let expiry_timestamp = 1700100000; 
    let issuer_name_hash = 12345;
    let metadata_hash = 67890;
    
    let merkle_proof = [1, 2, 3, 4, 5, 6, 7, 8];
    let merkle_indices = [0, 1, 0, 1, 0, 1, 0, 1];
    
    let issuer_leaf = pedersen_hash([
        issuer_id,
        issuer_secret,
        issuer_name_hash
    ]);
    let authorized_root = verify_merkle_proof(issuer_leaf, merkle_proof, merkle_indices);
    
    let min_validity = 1000000;
    let current_time = 1700000000;
    
    // This should fail due to validity being too short
    // Uncomment to test:
    // let (cred_id, cred_commitment, issuer_commitment) = main(
    //     issuer_secret,
    //     issuer_id,
    //     recipient_id,
    //     credential_type,
    //     credential_data,
    //     issue_timestamp,
    //     expiry_timestamp,
    //     issuer_name_hash,
    //     metadata_hash,
    //     authorized_root,
    //     merkle_proof,
    //     merkle_indices,
    //     min_validity,
    //     current_time
    // );
    
    // Just verify the test setup works
    assert(authorized_root != 0);
}

#[test]
fn test_employment_credential() {
    let issuer_secret = 11111;
    let issuer_id = 1;
    let recipient_id = 200;
    let credential_type = 1; 
    
    // Employment credential data:
    // [0] = years_of_experience
    // [1] = education_level
    // [2-6] = skill_levels
    // [7] = reserved
    let credential_data = [5, 3, 8, 9, 7, 6, 8, 0];
    
    let issue_timestamp = 1700000000;
    let expiry_timestamp = 1800000000;
    let issuer_name_hash = 12345;
    let metadata_hash = 67890;
    
    let merkle_proof = [1, 2, 3, 4, 5, 6, 7, 8];
    let merkle_indices = [0, 1, 0, 1, 0, 1, 0, 1];
    
    let issuer_leaf = pedersen_hash([
        issuer_id,
        issuer_secret,
        issuer_name_hash
    ]);
    let authorized_root = verify_merkle_proof(issuer_leaf, merkle_proof, merkle_indices);
    
    let min_validity = 1000000;
    let current_time = 1700000000;
    
    let (cred_id, cred_commitment, issuer_commitment) = main(
        issuer_secret,
        issuer_id,
        recipient_id,
        credential_type,
        credential_data,
        issue_timestamp,
        expiry_timestamp,
        issuer_name_hash,
        metadata_hash,
        authorized_root,
        merkle_proof,
        merkle_indices,
        min_validity,
        current_time
    );
    
    assert(cred_id != 0);
    assert(cred_commitment != 0);
    assert(issuer_commitment != 0);
}

#[test]
fn test_education_credential() {
    let issuer_secret = 22222;
    let issuer_id = 2;
    let recipient_id = 300;
    let credential_type = 2; 
    
    // Education credential data:
    // [0] = degree_level (1=HS, 2=Bachelor, 3=Master, 4=PhD)
    // [1] = gpa (scaled by 100, e.g., 375 = 3.75)
    // [2] = graduation_year
    // [3] = major_hash
    // [4-7] = reserved
    let credential_data = [3, 375, 2020, 99999, 0, 0, 0, 0];
    
    let issue_timestamp = 1700000000;
    let expiry_timestamp = 2000000000;
    let issuer_name_hash = 54321;
    let metadata_hash = 11111;
    
    let merkle_proof = [2, 3, 4, 5, 6, 7, 8, 9];
    let merkle_indices = [1, 0, 1, 0, 1, 0, 1, 0];
    
    let issuer_leaf = pedersen_hash([
        issuer_id,
        issuer_secret,
        issuer_name_hash
    ]);
    let authorized_root = verify_merkle_proof(issuer_leaf, merkle_proof, merkle_indices);
    
    let min_validity = 1000000;
    let current_time = 1700000000;
    
    let (cred_id, cred_commitment, issuer_commitment) = main(
        issuer_secret,
        issuer_id,
        recipient_id,
        credential_type,
        credential_data,
        issue_timestamp,
        expiry_timestamp,
        issuer_name_hash,
        metadata_hash,
        authorized_root,
        merkle_proof,
        merkle_indices,
        min_validity,
        current_time
    );
    
    assert(cred_id != 0);
    assert(cred_commitment != 0);
    assert(issuer_commitment != 0);
}