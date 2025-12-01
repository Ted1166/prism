// circuits/credential_verification/src/main.nr
use dep::std;
use std::hash::pedersen_hash;

fn main(
    // PRIVATE
    owner_secret: Field,
    owner_id: Field,
    credential_id: Field,
    credential_type: Field,
    credential_secret: Field,
    skill_levels: [Field; 5],
    years_of_experience: Field,
    education_level: Field,
    certifications: [Field; 3],
    issue_timestamp: Field,
    expiry_timestamp: Field,
    has_employment_proof: Field,
    employment_merkle_proof: [Field; 8],
    employment_merkle_indices: [Field; 8],
    
    // PUBLIC
    required_credential_type: pub Field,
    min_skill_levels: pub [Field; 5],
    min_experience_years: pub Field,
    min_education_level: pub Field,
    required_certification: pub Field,
    required_employment_root: pub Field,
    credential_commitment: pub Field,
    current_timestamp: pub Field
    
) -> pub (Field, Field, bool) {
    
    // 1. Verify credential ownership
    let computed_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        owner_id,
        skill_levels[0],
        skill_levels[1],
        skill_levels[2],
        skill_levels[3],
        skill_levels[4],
        years_of_experience,
        education_level
    ]);
    
    assert(computed_commitment == credential_commitment, "Invalid credential");
    
    // 2. Verify credential is valid & not expired
    assert(current_timestamp as u64 <= expiry_timestamp as u64, "Credential expired");
    assert(current_timestamp as u64 >= issue_timestamp as u64, "Invalid issue date");
    
    // 3. Verify credential type
    assert(credential_type == required_credential_type, "Wrong credential type");
    
    // 4. Verify all skill requirements
    for i in 0..5 {
        assert(skill_levels[i] as u64 <= 10, "Invalid skill level");
        assert(skill_levels[i] as u64 >= min_skill_levels[i] as u64, "Skill requirement not met");
    }
    
    // 5. Verify experience requirement
    assert(years_of_experience as u64 >= min_experience_years as u64, "Insufficient experience");
    assert(years_of_experience as u64 <= 50, "Unrealistic experience");
    assert(years_of_experience as u64 >= 0, "Negative experience");
    
    // 6. Verify education requirement
    assert(education_level as u64 >= min_education_level as u64, "Education requirement not met");
    assert(education_level as u64 >= 1, "Invalid education level");
    assert(education_level as u64 <= 4, "Invalid education level");
    
    // 7. Verify certification (if required)
    if required_certification != 0 {
        let mut has_cert = false;
        for i in 0..3 {
            if certifications[i] == required_certification {
                has_cert = true;
            }
        }
        assert(has_cert, "Required certification missing");
    }
    
    // 8. Verify employment (if required)
    if required_employment_root != 0 {
        assert(has_employment_proof == 1, "Employment proof required");
        
        let employment_leaf = pedersen_hash([
            owner_id,
            credential_id,
            years_of_experience,
            current_timestamp
        ]);
        
        let computed_root = verify_merkle_proof(
            employment_leaf,
            employment_merkle_proof,
            employment_merkle_indices
        );
        
        assert(computed_root == required_employment_root, "Employment verification failed");
    }
    
    // 9. Generate outputs
    let verification_nullifier = pedersen_hash([
        owner_secret,
        credential_id,
        required_credential_type,
        min_experience_years,
        current_timestamp
    ]);
    
    let owner_commitment = pedersen_hash([
        owner_id,
        owner_secret,
        credential_id
    ]);
    
    let verified = true;
    
    (verification_nullifier, owner_commitment, verified)
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

#[test]
fn test_valid_credential_verification() {
    let owner_secret = 99999;
    let owner_id = 100;
    let credential_id = 12345;
    let credential_type = 1;
    let credential_secret = 55555;
    let skills = [8, 7, 6, 5, 9];
    let experience = 5;
    let education = 2;
    let certs = [111, 222, 333];
    let issue_time = 1700000000;
    let expiry_time = 1800000000;
    let has_emp_proof = 0;
    let emp_proof = [0, 0, 0, 0, 0, 0, 0, 0];
    let emp_indices = [0, 0, 0, 0, 0, 0, 0, 0];
    
    let required_type = 1;
    let required_skills = [7, 5, 4, 3, 6];
    let min_exp = 3;
    let min_edu = 2;
    let required_cert = 0;
    let required_emp_root = 0;
    
    let credential_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        owner_id,
        skills[0],
        skills[1],
        skills[2],
        skills[3],
        skills[4],
        experience,
        education
    ]);
    
    let current_time = 1750000000;
    
    let (nullifier, _owner_commitment, verified) = main(
        owner_secret, owner_id, credential_id, credential_type,
        credential_secret, skills, experience, education, certs,
        issue_time, expiry_time, has_emp_proof, emp_proof, emp_indices,
        required_type, required_skills, min_exp, min_edu,
        required_cert, required_emp_root, credential_commitment, current_time
    );
    
    assert(nullifier != 0);
    assert(verified);
}

#[test]
fn test_certification_required() {
    let owner_secret = 99999;
    let owner_id = 100;
    let credential_id = 12345;
    let credential_type = 1;
    let credential_secret = 55555;
    let skills = [8, 7, 6, 5, 9];
    let experience = 5;
    let education = 2;
    let certs = [111, 222, 333];
    let issue_time = 1700000000;
    let expiry_time = 1800000000;
    let has_emp_proof = 0;
    let emp_proof = [0, 0, 0, 0, 0, 0, 0, 0];
    let emp_indices = [0, 0, 0, 0, 0, 0, 0, 0];
    
    let required_type = 1;
    let required_skills = [7, 5, 4, 3, 6];
    let min_exp = 3;
    let min_edu = 2;
    let required_cert = 222;
    let required_emp_root = 0;
    
    let credential_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        owner_id,
        skills[0],
        skills[1],
        skills[2],
        skills[3],
        skills[4],
        experience,
        education
    ]);
    
    let current_time = 1750000000;
    
    let (_nullifier, _owner_commitment, verified) = main(
        owner_secret, owner_id, credential_id, credential_type,
        credential_secret, skills, experience, education, certs,
        issue_time, expiry_time, has_emp_proof, emp_proof, emp_indices,
        required_type, required_skills, min_exp, min_edu,
        required_cert, required_emp_root, credential_commitment, current_time
    );
    
    assert(verified);
}

#[test]
fn print_credential_commitment() {
    let credential_id = 12345;
    let credential_secret = 55555;
    let owner_id = 100;
    let skill_levels = [8, 7, 6, 5, 9];
    let years_of_experience = 5;
    let education_level = 2;
    
    let credential_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        owner_id,
        skill_levels[0],
        skill_levels[1],
        skill_levels[2],
        skill_levels[3],
        skill_levels[4],
        years_of_experience,
        education_level
    ]);
    
    std::println("Credential Commitment:");
    std::println(credential_commitment);
    
    assert(credential_commitment != 0);
}