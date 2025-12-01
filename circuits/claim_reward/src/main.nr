use dep::std;
use std::hash::pedersen_hash;

fn main(
    // ============================================
    // PRIVATE INPUTS
    // ============================================
    reporter_secret: Field,
    reporter_id: Field,
    report_id: Field,
    company_id: Field,
    report_category: Field,
    incident_date: Field,
    incident_location_hash: Field,
    
    // ============================================
    // PUBLIC INPUTS
    // ============================================
    report_nullifier: pub Field,        
    reporter_commitment: pub Field,     
    verification_status: pub Field,     
    reward_amount: pub Field
) -> pub (Field, Field) {
    
    // ============================================
    // 1. VERIFY REPORT NULLIFIER MATCHES
    // ============================================
    let computed_nullifier = pedersen_hash([
        reporter_secret,
        company_id,
        report_category,
        incident_date,
        incident_location_hash
    ]);
    
    assert(computed_nullifier == report_nullifier, "Invalid reporter");
    
    // ============================================
    // 2. VERIFY REPORTER COMMITMENT MATCHES
    // ============================================
    let computed_commitment = pedersen_hash([
        reporter_id,
        reporter_secret,
        company_id
    ]);
    
    assert(computed_commitment == reporter_commitment, "Commitment mismatch");
    
    // ============================================
    // 3. VERIFY REPORT IS VERIFIED
    // ============================================
    assert(verification_status == 2, "Report not verified"); 
    
    // ============================================
    // 4. GENERATE CLAIM NULLIFIER
    // ============================================
    let claim_nullifier = pedersen_hash([
        reporter_secret,
        report_id,
        reward_amount
    ]);
    
    // ============================================
    // 5. PAYMENT RECIPIENT COMMITMENT
    // ============================================
    let payment_commitment = pedersen_hash([
        reporter_secret,
        report_id
    ]);
    
    (claim_nullifier, payment_commitment)
}

// ============================================
// TESTS
// ============================================

#[test]
fn test_valid_reward_claim() {
    let reporter_secret = 12345;
    let reporter_id = 1;
    let report_id = 100;
    let company_id = 500;
    let report_category = 1; 
    let incident_date = 1500000;
    let incident_location_hash = 999;
    
    let report_nullifier = pedersen_hash([
        reporter_secret,
        company_id,
        report_category,
        incident_date,
        incident_location_hash
    ]);
    
    let reporter_commitment = pedersen_hash([
        reporter_id,
        reporter_secret,
        company_id
    ]);
    
    let verification_status = 2; 
    let reward_amount = 50000; 
    
    let (claim_nullifier, payment_commitment) = main(
        reporter_secret,
        reporter_id,
        report_id,
        company_id,
        report_category,
        incident_date,
        incident_location_hash,
        report_nullifier,
        reporter_commitment,
        verification_status,
        reward_amount
    );
    
    assert(claim_nullifier != 0);
    assert(payment_commitment != 0);
    assert(claim_nullifier != payment_commitment);
}

#[test]
fn test_multiple_rewards_different_nullifiers() {
    let reporter_secret = 12345;
    let reporter_id = 1;
    let company_id = 500;
    let report_category = 1;
    let incident_date = 1500000;
    let incident_location_hash = 999;
    
    let report_nullifier = pedersen_hash([
        reporter_secret,
        company_id,
        report_category,
        incident_date,
        incident_location_hash
    ]);
    
    let reporter_commitment = pedersen_hash([
        reporter_id,
        reporter_secret,
        company_id
    ]);
    
    let verification_status = 2;
    
    let report_id_1 = 100;
    let reward_amount_1 = 50000;
    
    let (claim_nullifier_1, payment_commitment_1) = main(
        reporter_secret,
        reporter_id,
        report_id_1,
        company_id,
        report_category,
        incident_date,
        incident_location_hash,
        report_nullifier,
        reporter_commitment,
        verification_status,
        reward_amount_1
    );
    
    let report_id_2 = 101;
    let reward_amount_2 = 75000;
    
    let (claim_nullifier_2, payment_commitment_2) = main(
        reporter_secret,
        reporter_id,
        report_id_2,
        company_id,
        report_category,
        incident_date,
        incident_location_hash,
        report_nullifier,
        reporter_commitment,
        verification_status,
        reward_amount_2
    );
    
    assert(claim_nullifier_1 != claim_nullifier_2);
    assert(payment_commitment_1 != payment_commitment_2);
}

#[test]
fn test_print_commitments() {
    let reporter_secret = 12345;
    let reporter_id = 1;
    let report_id = 100;
    let company_id = 500;
    let report_category = 1;
    let incident_date = 1500000;
    let incident_location_hash = 999;
    
    let report_nullifier = pedersen_hash([
        reporter_secret,
        company_id,
        report_category,
        incident_date,
        incident_location_hash
    ]);
    
    let reporter_commitment = pedersen_hash([
        reporter_id,
        reporter_secret,
        company_id
    ]);
    
    std::println("Report Nullifier:");
    std::println(report_nullifier);
    std::println("Reporter Commitment:");
    std::println(reporter_commitment);
    
    let verification_status = 2;
    let reward_amount = 50000;
    
    let (claim_nullifier, payment_commitment) = main(
        reporter_secret,
        reporter_id,
        report_id,
        company_id,
        report_category,
        incident_date,
        incident_location_hash,
        report_nullifier,
        reporter_commitment,
        verification_status,
        reward_amount
    );
    
    std::println("Claim Nullifier:");
    std::println(claim_nullifier);
    std::println("Payment Commitment:");
    std::println(payment_commitment);
    
    assert(claim_nullifier != 0);
    assert(payment_commitment != 0);
}