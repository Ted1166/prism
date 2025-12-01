// circuits/job_application/src/main.nr
// Proves: "I meet all job requirements and want to apply anonymously"

use dep::std;
use std::hash::pedersen_hash;

fn main(
    // ============================================
    // PRIVATE INPUTS (Never revealed on-chain)
    // ============================================
    
    // Applicant identity
    applicant_secret: Field,
    applicant_id: Field,
    
    // Credential data
    credential_id: Field,
    credential_secret: Field,
    credential_type: Field,
    
    // Skills and qualifications
    skill_levels: [Field; 5],      // 5 skills rated 0-10
    years_of_experience: Field,    // Total years
    education_level: Field,        // 1=HS, 2=Bachelor, 3=Master, 4=PhD
    total_projects: Field,         // Number of completed projects
    
    // Certifications
    certifications: [Field; 3],    // Up to 3 certification hashes
    
    // Employment history (for verification)
    previous_companies: [Field; 3],
    previous_durations: [Field; 3], // Duration at each company (in years)
    
    // References
    reference_hashes: [Field; 2],  // 2 professional references
    
    // Optional: Proof of specific company experience
    has_company_proof: Field,      // 0 or 1
    company_merkle_proof: [Field; 10],
    company_merkle_indices: [Field; 10],
    
    // ============================================
    // PUBLIC INPUTS (Visible on-chain)
    // ============================================
    
    // Job identification
    job_id: pub Field,
    
    // Requirements
    required_credential_type: pub Field,
    required_skills: pub [Field; 5],
    min_experience: pub Field,
    min_education: pub Field,
    min_projects: pub Field,
    required_certification: pub Field,  // 0 if not required
    required_company_root: pub Field,   // 0 if not required
    
    // Credential commitment
    credential_commitment: pub Field,
    
    // Timing
    current_timestamp: pub Field,
    application_deadline: pub Field
    
) -> pub (Field, Field, Field) {
    
    // ============================================
    // 1. VERIFY CREDENTIAL OWNERSHIP
    // ============================================
    
    let computed_credential = pedersen_hash([
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
    
    assert(
        computed_credential == credential_commitment,
        "Invalid credential"
    );
    
    // ============================================
    // 2. VERIFY APPLICATION TIMING
    // ============================================
    
    assert(
        current_timestamp as u64 <= application_deadline as u64,
        "Application deadline passed"
    );
    
    // ============================================
    // 3. VERIFY CREDENTIAL TYPE
    // ============================================
    
    assert(
        credential_type == required_credential_type,
        "Wrong credential type"
    );
    
    // ============================================
    // 4. VERIFY ALL SKILL REQUIREMENTS
    // ============================================
    
    for i in 0..5 {
        // Validate skill level is in range (0-10)
        assert(skill_levels[i] as u64 <= 10, "Invalid skill level");
        
        // Check meets requirement
        assert(
            skill_levels[i] as u64 >= required_skills[i] as u64,
            "Skill requirement not met"
        );
    }
    
    // ============================================
    // 5. VERIFY EXPERIENCE REQUIREMENTS
    // ============================================
    
    assert(
        years_of_experience as u64 >= min_experience as u64,
        "Insufficient experience"
    );
    
    // Validate experience is reasonable
    assert(years_of_experience as u64 >= 0, "Negative experience");
    assert(years_of_experience as u64 <= 50, "Unrealistic experience");
    
    // Verify experience matches employment history
    let mut total_history: Field = 0;
    for i in 0..3 {
        if previous_companies[i] != 0 {
            assert(previous_durations[i] as u64 <= 50, "Unrealistic duration");
            total_history = total_history + previous_durations[i];
        }
    }
    
    // If history provided, verify it roughly matches claimed experience
    if total_history as u64 > 0 {
        // Allow some flexibility (gaps, overlaps, rounding)
        assert(
            years_of_experience as u64 <= (total_history as u64 + 2),
            "Experience exceeds history"
        );
    }
    
    // ============================================
    // 6. VERIFY EDUCATION REQUIREMENT
    // ============================================
    
    assert(
        education_level as u64 >= min_education as u64,
        "Education requirement not met"
    );
    
    // Validate education level
    assert(education_level as u64 >= 1, "Invalid education level");
    assert(education_level as u64 <= 4, "Invalid education level");
    
    // ============================================
    // 7. VERIFY PROJECT REQUIREMENT
    // ============================================
    
    assert(
        total_projects as u64 >= min_projects as u64,
        "Insufficient projects"
    );
    
    // Validate projects are reasonable given experience
    // Assume max 10 projects per year
    let max_expected_projects = years_of_experience * 10;
    assert(
        total_projects as u64 <= max_expected_projects as u64,
        "Unrealistic project count"
    );
    
    // ============================================
    // 8. VERIFY CERTIFICATION (if required)
    // ============================================
    
    if required_certification != 0 {
        let mut has_cert = false;
        
        for i in 0..3 {
            if certifications[i] == required_certification {
                has_cert = true;
            }
        }
        
        assert(has_cert, "Required certification missing");
    }
    
    // ============================================
    // 9. VERIFY SPECIFIC COMPANY EXPERIENCE (if required)
    // ============================================
    
    if required_company_root != 0 {
        assert(
            has_company_proof == 1,
            "Company experience proof required"
        );
        
        // Create employment leaf
        let employment_leaf = pedersen_hash([
            applicant_id,
            credential_id,
            years_of_experience,
            previous_companies[0], // Most recent company
            current_timestamp
        ]);
        
        // Verify Merkle proof
        let computed_root = verify_merkle_proof(
            employment_leaf,
            company_merkle_proof,
            company_merkle_indices
        );
        
        assert(
            computed_root == required_company_root,
            "Required company experience not verified"
        );
    }
    
    // ============================================
    // 10. VERIFY REFERENCES
    // ============================================
    
    // At least one reference must be provided
    assert(reference_hashes[0] != 0, "At least one reference required");
    
    // ============================================
    // 11. CALCULATE QUALIFICATION SCORE
    // ============================================
    
    // Calculate how much applicant exceeds minimum requirements
    // This can be used for ranking applicants
    
    let mut skill_surplus: Field = 0;
    for i in 0..5 {
        if skill_levels[i] as u64 > required_skills[i] as u64 {
            skill_surplus = skill_surplus + (skill_levels[i] - required_skills[i]);
        }
    }
    
    let experience_surplus = if years_of_experience as u64 > min_experience as u64 {
        years_of_experience - min_experience
    } else {
        0
    };
    
    let education_surplus = if education_level as u64 > min_education as u64 {
        education_level - min_education
    } else {
        0
    };
    
    let project_surplus = if total_projects as u64 > min_projects as u64 {
        total_projects - min_projects
    } else {
        0
    };
    
    // Simple qualification score
    let qualification_score = skill_surplus + experience_surplus + education_surplus + project_surplus;
    
    // ============================================
    // 12. GENERATE OUTPUTS
    // ============================================
    
    // Application nullifier (prevents double application)
    // Unique per: applicant + job
    let application_nullifier = pedersen_hash([
        applicant_secret,
        job_id,
        credential_id
    ]);
    
    // Applicant commitment (for employer to contact after selection)
    let applicant_commitment = pedersen_hash([
        applicant_id,
        applicant_secret,
        credential_id,
        current_timestamp
    ]);
    
    // Score commitment (for ranking, but keeps score private)
    let score_commitment = pedersen_hash([
        applicant_secret,
        qualification_score
    ]);
    
    (application_nullifier, applicant_commitment, score_commitment)
}

// ============================================
// HELPER FUNCTIONS
// ============================================

fn verify_merkle_proof(
    leaf: Field,
    proof: [Field; 10],
    indices: [Field; 10]
) -> Field {
    let mut current = leaf;
    
    for i in 0..10 {
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
fn test_valid_job_application() {
    // Setup applicant data
    let applicant_secret = 77777;
    let applicant_id = 200;
    let credential_id = 5000;
    let credential_secret = 55555;
    let credential_type = 1; // Employment credential
    
    // Applicant's qualifications (PRIVATE)
    let skills = [8, 9, 7, 6, 8]; // All above requirements
    let experience = 5;
    let education = 3; // Master's degree
    let projects = 20;
    let certs = [111, 222, 0];
    let companies = [1001, 1002, 0];
    let durations = [2, 3, 0]; // 2 years + 3 years = 5 years total
    let references = [999, 888];
    
    // No specific company proof needed
    let has_company = 0;
    let company_proof = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let company_indices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    // Job requirements (PUBLIC)
    let job_id = 42;
    let required_type = 1;
    let required_skills = [7, 7, 5, 4, 6]; // Lower than applicant's
    let min_exp = 3;
    let min_edu = 2;
    let min_proj = 10;
    let required_cert = 0; // Not required
    let required_company = 0; // Not required
    
    // Generate credential commitment
    let credential_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        applicant_id,
        skills[0],
        skills[1],
        skills[2],
        skills[3],
        skills[4],
        experience,
        education
    ]);
    
    let current_time = 1700000000;
    let deadline = 1750000000;
    
    // Submit application
    let (nullifier, _commitment, score) = main(
        applicant_secret,
        applicant_id,
        credential_id,
        credential_secret,
        credential_type,
        skills,
        experience,
        education,
        projects,
        certs,
        companies,
        durations,
        references,
        has_company,
        company_proof,
        company_indices,
        job_id,
        required_type,
        required_skills,
        min_exp,
        min_edu,
        min_proj,
        required_cert,
        required_company,
        credential_commitment,
        current_time,
        deadline
    );
    
    // Verify outputs
    assert(nullifier != 0, "Nullifier should be generated");
    assert(score != 0, "Score should be generated");
}

#[test]
fn test_certification_required() {
    let applicant_secret = 77777;
    let applicant_id = 200;
    let credential_id = 5000;
    let credential_secret = 55555;
    let credential_type = 1;
    let skills = [8, 9, 7, 6, 8];
    let experience = 5;
    let education = 3;
    let projects = 20;
    let certs = [111, 222, 333]; // Has cert 222
    let companies = [1001, 1002, 0];
    let durations = [2, 3, 0];
    let references = [999, 888];
    
    let has_company = 0;
    let company_proof = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let company_indices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    let job_id = 42;
    let required_type = 1;
    let required_skills = [7, 7, 5, 4, 6];
    let min_exp = 3;
    let min_edu = 2;
    let min_proj = 10;
    let required_cert = 222; // Requires cert 222
    let required_company = 0;
    
    let credential_commitment = pedersen_hash([
        credential_id,
        credential_secret,
        applicant_id,
        skills[0],
        skills[1],
        skills[2],
        skills[3],
        skills[4],
        experience,
        education
    ]);
    
    let current_time = 1700000000;
    let deadline = 1750000000;
    
    let (nullifier, _commitment, _score) = main(
        applicant_secret,
        applicant_id,
        credential_id,
        credential_secret,
        credential_type,
        skills,
        experience,
        education,
        projects,
        certs,
        companies,
        durations,
        references,
        has_company,
        company_proof,
        company_indices,
        job_id,
        required_type,
        required_skills,
        min_exp,
        min_edu,
        min_proj,
        required_cert,
        required_company,
        credential_commitment,
        current_time,
        deadline
    );
    
    assert(nullifier != 0, "Should pass with certification");
}

#[test]
fn print_credential_commitment() {
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
    
    std::println("Credential Commitment:");
    std::println(credential_commitment);
    
    assert(credential_commitment != 0);
}