// Helper script to calculate credential commitment
// Create this as: circuits/job_application/src/bin/calc_commitment.nr
// Or run this snippet to get the value

use dep::std;
use std::hash::pedersen_hash;

fn main() {
    // Your credential data
    let credential_id = 5000;
    let credential_secret = 55555;
    let applicant_id = 200;
    let skill_levels = [8, 9, 7, 6, 8];
    let years_of_experience = 5;
    let education_level = 3;
    
    // Calculate the credential commitment
    let credential_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        applicant_id,
        skill_levels[0],
        skill_levels[1],
        skill_levels[2],
        skill_levels[3],
        skill_levels[4],
        years_of_experience,
        education_level
    ]);
    
    // This will print in the test output
    std::println(credential_commitment);
}

#[test]
fn calculate_credential_commitment() {
    // Credential data from your test
    let credential_id = 5000;
    let credential_secret = 55555;
    let applicant_id = 200;
    let skill_levels = [8, 9, 7, 6, 8];
    let years_of_experience = 5;
    let education_level = 3;
    
    let credential_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        applicant_id,
        skill_levels[0],
        skill_levels[1],
        skill_levels[2],
        skill_levels[3],
        skill_levels[4],
        years_of_experience,
        education_level
    ]);
    
    // The commitment will be shown when test runs
    assert(credential_commitment != 0);
    std::println(credential_commitment);
}