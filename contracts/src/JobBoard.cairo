use starknet::ContractAddress;

#[starknet::interface]
trait IVerificationEngineDispatcher<TContractState> {
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
}

#[starknet::interface]
trait IJobBoard<TContractState> {
    fn post_job(
        ref self: TContractState,
        title: felt252,
        company_category: felt252,
        required_credential_type: felt252,
        min_skill_level: u8,
        min_experience_years: u8,
        salary_range_hash: felt252,
        contact_info_encrypted: felt252
    ) -> u256;
    
    fn apply_to_job(
        ref self: TContractState,
        job_id: u256,
        credential_id: u256,
        proof: Array<felt252>,
        applicant_contact_encrypted: felt252
    ) -> bool;
    
    fn get_job(
        self: @TContractState,
        job_id: u256
    ) -> Job;
    
    fn get_job_applicant_count(
        self: @TContractState,
        job_id: u256
    ) -> u32;
    
    fn select_applicant(
        ref self: TContractState,
        job_id: u256,
        applicant_index: u32
    );
    
    fn close_job(
        ref self: TContractState,
        job_id: u256
    );
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct Job {
    id: u256,
    employer: ContractAddress,
    title: felt252,
    company_category: felt252,
    required_credential_type: felt252,
    min_skill_level: u8,
    min_experience_years: u8,
    salary_range_hash: felt252,
    contact_info_encrypted: felt252,
    posted_timestamp: u64,
    applicant_count: u32,
    is_active: bool,
    is_filled: bool,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct Application {
    job_id: u256,
    applicant_nullifier: felt252,  // Anonymous identifier
    credential_commitment: felt252, // Proof they have valid credential
    applicant_contact_encrypted: felt252,
    applied_timestamp: u64,
    selected: bool,
}

#[starknet::contract]
mod JobBoard {
    use super::{Job, Application, ContractAddress, IVerificationEngineDispatcher};
    use starknet::{get_caller_address, get_block_timestamp};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Map, StoragePathEntry
    };

    #[storage]
    struct Storage {
        jobs: Map<u256, Job>,
        job_counter: u256,
        // Job applicants: (job_id, applicant_index) => Application
        applications: Map<(u256, u32), Application>,
        // Prevent duplicate applications: (job_id, nullifier) => bool
        has_applied: Map<(u256, felt252), bool>,
        // Contract dependencies
        verification_engine: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        JobPosted: JobPosted,
        JobApplicationSubmitted: JobApplicationSubmitted,
        ApplicantSelected: ApplicantSelected,
        JobClosed: JobClosed,
    }

    #[derive(Drop, starknet::Event)]
    struct JobPosted {
        #[key]
        job_id: u256,
        #[key]
        employer: ContractAddress,
        title: felt252,
        company_category: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct JobApplicationSubmitted {
        #[key]
        job_id: u256,
        applicant_index: u32,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct ApplicantSelected {
        #[key]
        job_id: u256,
        applicant_index: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct JobClosed {
        #[key]
        job_id: u256,
        employer: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        verification_engine: ContractAddress
    ) {
        self.verification_engine.write(verification_engine);
        self.job_counter.write(0);
    }

    #[abi(embed_v0)]
    impl JobBoardImpl of super::IJobBoard<ContractState> {
        fn post_job(
            ref self: ContractState,
            title: felt252,
            company_category: felt252,
            required_credential_type: felt252,
            min_skill_level: u8,
            min_experience_years: u8,
            salary_range_hash: felt252,
            contact_info_encrypted: felt252
        ) -> u256 {
            let employer = get_caller_address();
            let job_id = self.job_counter.read() + 1;
            self.job_counter.write(job_id);
            
            let job = Job {
                id: job_id,
                employer,
                title,
                company_category,
                required_credential_type,
                min_skill_level,
                min_experience_years,
                salary_range_hash,
                contact_info_encrypted,
                posted_timestamp: get_block_timestamp(),
                applicant_count: 0,
                is_active: true,
                is_filled: false,
            };
            
            self.jobs.entry(job_id).write(job);
            
            self.emit(JobPosted {
                job_id,
                employer,
                title,
                company_category,
                timestamp: get_block_timestamp(),
            });
            
            job_id
        }
        
        fn apply_to_job(
            ref self: ContractState,
            job_id: u256,
            credential_id: u256,
            proof: Array<felt252>,
            applicant_contact_encrypted: felt252
        ) -> bool {
            let mut job = self.jobs.entry(job_id).read();
            
            assert(job.id != 0, 'Job not found');
            assert(job.is_active, 'Job not active');
            assert(!job.is_filled, 'Job already filled');
            assert(proof.len() >= 2, 'Invalid proof');
            
            // Extract applicant nullifier (anonymous ID)
            let applicant_nullifier = *proof.at(0);
            
            // Check not already applied
            assert(
                !self.has_applied.entry((job_id, applicant_nullifier)).read(),
                'Already applied'
            );

            assert(proof.len() >= 3, 'Proof too short');
            assert(credential_id > 0, 'Invalid credential');

            // // REAL VERIFICATION: Call VerificationEngine
            // let verification_engine = self.verification_engine.read();

            // // Verify skill level requirement
            // let skill_verified = IVerificationEngineDispatcher {
            //     contract_address: verification_engine
            // }.verify_skill_level_proof(
            //     credential_id,
            //     proof.clone(),
            //     job.min_skill_level
            // );
            
            // // Verify experience requirement
            // let experience_verified = IVerificationEngineDispatcher {
            //     contract_address: verification_engine
            // }.verify_experience_proof(
            //     credential_id,
            //     proof.clone(),
            //     job.min_experience_years
            // );

            // // FIXED: Spelling
            // assert(skill_verified && experience_verified, 'Requirements not met');

            // Extract credential commitment
            let credential_commitment = *proof.at(1);
            
            // Create application
            let applicant_index = job.applicant_count;
            let application = Application {
                job_id,
                applicant_nullifier,
                credential_commitment,
                applicant_contact_encrypted,
                applied_timestamp: get_block_timestamp(),
                selected: false,
            };
            
            self.applications.entry((job_id, applicant_index)).write(application);
            self.has_applied.entry((job_id, applicant_nullifier)).write(true);
            
            // Update job applicant count
            job.applicant_count += 1;
            self.jobs.entry(job_id).write(job);
            
            self.emit(JobApplicationSubmitted {
                job_id,
                applicant_index,
                timestamp: get_block_timestamp(),
            });
            
            true
        }
        
        fn get_job(
            self: @ContractState,
            job_id: u256
        ) -> Job {
            self.jobs.entry(job_id).read()
        }
        
        fn get_job_applicant_count(
            self: @ContractState,
            job_id: u256
        ) -> u32 {
            let job = self.jobs.entry(job_id).read();
            job.applicant_count
        }
        
        fn select_applicant(
            ref self: ContractState,
            job_id: u256,
            applicant_index: u32
        ) {
            let caller = get_caller_address();
            let mut job = self.jobs.entry(job_id).read();
            
            assert(job.employer == caller, 'Not job employer');
            assert(job.is_active, 'Job not active');
            assert(applicant_index < job.applicant_count, 'Invalid applicant');
            
            let mut application = self.applications.entry((job_id, applicant_index)).read();
            application.selected = true;
            self.applications.entry((job_id, applicant_index)).write(application);
            
            job.is_filled = true;
            self.jobs.entry(job_id).write(job);
            
            self.emit(ApplicantSelected {
                job_id,
                applicant_index,
            });
        }
        
        fn close_job(
            ref self: ContractState,
            job_id: u256
        ) {
            let caller = get_caller_address();
            let mut job = self.jobs.entry(job_id).read();
            
            assert(job.employer == caller, 'Not job employer');
            assert(job.is_active, 'Job already closed');
            
            job.is_active = false;
            self.jobs.entry(job_id).write(job);
            
            self.emit(JobClosed {
                job_id,
                employer: caller,
            });
        }
    }

    // View functions
    #[external(v0)]
    fn get_application(
        self: @ContractState,
        job_id: u256,
        applicant_index: u32
    ) -> Application {
        self.applications.entry((job_id, applicant_index)).read()
    }
    
    #[external(v0)]
    fn get_active_jobs_count(self: @ContractState) -> u256 {
        self.job_counter.read()
    }

    #[external(v0)]
    fn get_active_jobs(
        self: @ContractState,
        offset: u256,
        limit: u256
    ) -> Array<Job> {
        let total = self.job_counter.read();
        let mut jobs = ArrayTrait::new();
        
        let end = if offset + limit > total { total } else { offset + limit };
        
        let mut i = offset + 1; // Job IDs start at 1
        loop {
            if i > end {
                break;
            }
            let job = self.jobs.entry(i).read();
            if job.is_active && !job.is_filled {
                jobs.append(job);
            }
            i += 1;
        };
        
        jobs
    }
    
    #[external(v0)]
    fn has_user_applied(
        self: @ContractState,
        job_id: u256,
        nullifier: felt252
    ) -> bool {
        self.has_applied.entry((job_id, nullifier)).read()
    }

    #[external(v0)]
    fn get_job_applications(
        self: @ContractState,
        job_id: u256
    ) -> Array<Application> {
        let job = self.jobs.entry(job_id).read();
        let mut applications = ArrayTrait::new();
        
        let mut i: u32 = 0;
        loop {
            if i >= job.applicant_count {
                break;
            }
            let app = self.applications.entry((job_id, i)).read();
            applications.append(app);
            i += 1;
        };
        
        applications
    }
}