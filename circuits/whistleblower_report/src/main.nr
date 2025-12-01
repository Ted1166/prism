// Proves: "I worked at this company and witnessed this issue"

use dep::std;
use std::hash::pedersen_hash;

fn main(
    // ============================================
    // PRIVATE INPUTS
    // ============================================
    
    // Reporter identity
    reporter_secret: Field,
    reporter_id: Field,
    
    // Employment verification
    employee_number: Field,
    company_id: Field,
    department_id: Field,
    role_level: Field,
    employment_start: Field,
    employment_end: Field,
    access_level: Field, // Security clearance level
    
    // Merkle proof of employment
    employment_merkle_proof: [Field; 12],
    employment_merkle_indices: [Field; 12],
    
    // Report details
    incident_date: Field,
    incident_location_hash: Field,
    incident_type: Field,
    incident_severity: Field,
    
    // Evidence
    evidence_hash: Field,
    evidence_type: Field, // 1=document, 2=photo, 3=video, 4=audio
    evidence_timestamp: Field,
    witness_count: Field,
    witness_hashes: [Field; 5], // Up to 5 witnesses
    
    // Additional context
    previous_reports_count: Field, // Has this been reported before?
    financial_impact: Field, // Estimated $ impact (in categories)
    affected_people_count: Field,
    
    // ============================================
    // PUBLIC INPUTS
    // ============================================
    
    company_merkle_root: pub Field,
    
    // Report requirements
    min_employment_duration: pub Field,  // Minimum days to be credible
    min_access_level: pub Field,         // Minimum security level
    report_category: pub Field,          // Fraud, harassment, safety, etc.
    
    // Severity validation
    severity: pub Field, // 1-5
    
    // Timing
    current_timestamp: pub Field,
    max_report_age: pub Field // How old can the incident be?
    
) -> pub (Field, Field, Field, Field, bool) {
    
    // ============================================
    // 1. VERIFY EMPLOYMENT
    // ============================================
    
    // Create employment leaf
    let employment_leaf = pedersen_hash([
        employee_number,
        reporter_id,
        company_id,
        department_id,
        role_level,
        employment_start,
        employment_end,
        access_level
    ]);
    
    // Verify employment in company registry
    let computed_root = verify_merkle_proof_12(
        employment_leaf,
        employment_merkle_proof,
        employment_merkle_indices
    );
    
    assert(computed_root == company_merkle_root, "Employment not verified");
    
    // ============================================
    // 2. VERIFY EMPLOYMENT DURATION
    // ============================================
    
    let employment_duration = employment_end - employment_start;
    assert(
        employment_duration as u64 >= min_employment_duration as u64,
        "Insufficient employment duration"
    );
    
    // Verify dates are logical
    assert(employment_start as u64 < employment_end as u64, "Invalid employment dates");
    assert(employment_end as u64 <= current_timestamp as u64, "Future employment end");
    
    // ============================================
    // 3. VERIFY ACCESS LEVEL
    // ============================================
    
    assert(access_level as u64 >= min_access_level as u64, "Insufficient access level");
    assert((access_level as u64 >= 1) & (access_level as u64 <= 10), "Invalid access level");
    
    // ============================================
    // 4. VERIFY INCIDENT TIMING
    // ============================================
    
    // Incident must have occurred during employment
    assert(incident_date as u64 >= employment_start as u64, "Incident before employment");
    assert(incident_date as u64 <= employment_end as u64, "Incident after employment");
    
    // Incident can't be too old
    let report_age = current_timestamp - incident_date;
    assert(report_age as u64 <= max_report_age as u64, "Incident too old");
    
    // ============================================
    // 5. VERIFY SEVERITY
    // ============================================
    
    assert((severity as u64 >= 1) & (severity as u64 <= 5), "Invalid severity");
    assert(severity == incident_severity, "Severity mismatch");
    
    // Verify severity matches impact
    if severity as u64 >= 4 {
        // High severity requires significant impact
        assert(
            (financial_impact as u64 >= 3) | (affected_people_count as u64 >= 10),
            "High severity requires significant impact"
        );
    }
    
    // ============================================
    // 6. VERIFY EVIDENCE
    // ============================================
    
    assert(evidence_hash != 0, "Evidence required");
    assert((evidence_type as u64 >= 1) & (evidence_type as u64 <= 4), "Invalid evidence type");
    
    // Evidence timestamp should be reasonable
    assert(evidence_timestamp as u64 >= incident_date as u64, "Evidence predates incident");
    assert(
        evidence_timestamp as u64 <= current_timestamp as u64,
        "Future evidence timestamp"
    );
    
    // ============================================
    // 7. VERIFY WITNESSES
    // ============================================
    
    assert(witness_count as u64 <= 5, "Too many witnesses");
    
    // Count non-zero witness hashes
    let mut actual_witnesses: Field = 0;
    for i in 0..5 {
        if witness_hashes[i] != 0 {
            actual_witnesses = actual_witnesses + 1;
        }
    }
    
    assert(actual_witnesses == witness_count, "Witness count mismatch");
    
    // High severity reports should have witnesses
    if severity as u64 >= 4 {
        assert(witness_count as u64 >= 1, "High severity requires witnesses");
    }
    
    // ============================================
    // 8. VERIFY REPORT CATEGORY
    // ============================================
    
    assert((report_category as u64 >= 1) & (report_category as u64 <= 10), "Invalid category");
    assert(report_category == incident_type, "Category mismatch");
    
    // ============================================
    // 9. CALCULATE CREDIBILITY SCORE
    // ============================================
    
    // Factors that increase credibility
    let tenure_score: Field = if employment_duration as u64 > 730 { 2 } else { 1 };
    let access_score = if access_level as u64 >= 5 { 2 } else { 1 };
    let witness_score = witness_count;
    let recency_score = if report_age as u64 < 90 { 2 } else { 1 };
    let evidence_score = if (evidence_type == 3) | (evidence_type == 4) { 2 } else { 1 };
    
    let credibility_score = tenure_score + access_score + witness_score + recency_score + evidence_score;
    
    // Minimum credibility required
    assert(credibility_score as u64 >= 5, "Insufficient credibility");
    
    // ============================================
    // 10. VERIFY NOT DUPLICATE
    // ============================================
    
    // If previous reports exist, verify this is genuinely new information
    if previous_reports_count as u64 > 0 {
        // Must have new evidence or new witnesses
        assert(
            evidence_timestamp as u64 > (incident_date as u64 + (30 * 86400)),
            "Appears to be duplicate report"
        );
    }
    
    // ============================================
    // 11. GENERATE OUTPUTS
    // ============================================
    
    // Report nullifier (prevents same person reporting same incident twice)
    let report_nullifier = pedersen_hash([
        reporter_secret,
        company_id,
        report_category,
        incident_date,
        incident_location_hash
    ]);
    
    // Evidence commitment
    let evidence_commitment = pedersen_hash([
        evidence_hash,
        evidence_type,
        evidence_timestamp,
        reporter_secret,
        incident_date
    ]);
    
    // Reporter commitment (for reward claiming)
    let reporter_commitment = pedersen_hash([
        reporter_id,
        reporter_secret,
        company_id
    ]);
    
    // Credibility score commitment
    let credibility_commitment = pedersen_hash([
        reporter_secret,
        credibility_score
    ]);
    
    // Report is verified
    let verified = true;
    
    (report_nullifier, evidence_commitment, reporter_commitment, credibility_commitment, verified)
}

fn verify_merkle_proof_12(
    leaf: Field,
    proof: [Field; 12],
    indices: [Field; 12]
) -> Field {
    let mut current = leaf;
    
    for i in 0..12 {
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
fn print_company_root() {
    let employee_num = 100;
    let reporter_id = 1;
    let company_id = 500;
    let department = 10;
    let role = 5;
    let start_time = 1000000;
    let end_time = 2000000;
    let access = 7;
    
    let merkle_proof = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let merkle_indices = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    
    let employment_leaf = pedersen_hash([
        employee_num,
        reporter_id,
        company_id,
        department,
        role,
        start_time,
        end_time,
        access
    ]);
    
    let company_root = verify_merkle_proof_12(employment_leaf, merkle_proof, merkle_indices);
    
    std::println("Company Merkle Root:");
    std::println(company_root);
    
    assert(company_root != 0);
}

#[test]
fn test_valid_whistleblower_report() {
    let reporter_secret = 12345;
    let reporter_id = 1;
    let employee_num = 100;
    let company_id = 500;
    let department = 10;
    let role = 5;
    let start_time = 1000000;
    let end_time = 2000000;
    let access = 7;
    
    let merkle_proof = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let merkle_indices = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    
    let incident_date = 1500000;
    let location_hash = 999;
    let incident_type = 1; // Fraud
    let incident_severity = 4;
    
    let evidence = 777;
    let evidence_type = 1; // Document
    let evidence_time = 1500100;
    let witnesses = 2;
    let witness_hashes = [111, 222, 0, 0, 0];
    
    let previous = 0;
    let financial = 4; // High
    let affected = 50;
    
    let employment_leaf = pedersen_hash([
        employee_num,
        reporter_id,
        company_id,
        department,
        role,
        start_time,
        end_time,
        access
    ]);
    let company_root = verify_merkle_proof_12(employment_leaf, merkle_proof, merkle_indices);
    
    let min_duration = 100000;
    let min_access = 5;
    let category = 1;
    let severity = 4;
    let current = 2000001;
    let max_age = 1000000;
    
    let (nullifier, evidence_commit, reporter_commit, credibility, verified) = main(
        reporter_secret,
        reporter_id,
        employee_num,
        company_id,
        department,
        role,
        start_time,
        end_time,
        access,
        merkle_proof,
        merkle_indices,
        incident_date,
        location_hash,
        incident_type,
        incident_severity,
        evidence,
        evidence_type,
        evidence_time,
        witnesses,
        witness_hashes,
        previous,
        financial,
        affected,
        company_root,
        min_duration,
        min_access,
        category,
        severity,
        current,
        max_age
    );
    
    assert(nullifier != 0);
    assert(evidence_commit != 0);
    assert(reporter_commit != 0);
    assert(credibility != 0);
    assert(verified);
}