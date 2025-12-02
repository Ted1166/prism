export interface UserCredentials {
  name: string;
  employer: string;
  yearsExperience: number;
  education: string;
  skills: {
    name: string;
    level: number;
  }[];
  projects: number;
}

export interface JobApplication {
  id: string;
  nullifier: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: string;
  lastUpdate: string;
  status: 'submitted' | 'under_review' | 'interview' | 'offer' | 'accepted' | 'rejected';
  requirements: {
    minExperience: number;
    minEducation: string;
    requiredSkills: { name: string; minLevel: number }[];
  };
  timeline: {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'pending' | 'rejected';
    timestamp?: string;
    description?: string;
  }[];
}

export interface WhistleblowerReport {
  id: string;
  nullifier: string;
  reporterCommitment: string;
  incidentType: string;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
  submittedDate: string;
  lastUpdate: string;
  status: 'submitted' | 'pending' | 'under_investigation' | 'verified' | 'dismissed' | 'reward_available';
  witnessCount: number;
  evidenceHash: string;
  timeline: {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'pending' | 'rejected';
    timestamp?: string;
    description?: string;
  }[];
  rewardAmount?: string;
}

// Storage keys
const STORAGE_KEYS = {
  CREDENTIALS: 'prism_user_credentials',
  APPLICATIONS: 'prism_applications',
  REPORTS: 'prism_reports',
};

// ============= USER CREDENTIALS =============

export const saveUserCredentials = (credentials: UserCredentials): void => {
  localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
};

export const getUserCredentials = (): UserCredentials | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
  return data ? JSON.parse(data) : null;
};

export const getDefaultCredentials = (): UserCredentials => {
  return {
    name: 'Alice Johnson',
    employer: 'Google',
    yearsExperience: 7,
    education: "Master's Degree",
    skills: [
      { name: 'React', level: 8 },
      { name: 'TypeScript', level: 9 },
      { name: 'Node.js', level: 7 },
      { name: 'SQL', level: 6 },
      { name: 'Docker', level: 8 },
    ],
    projects: 20,
  };
};

// ============= JOB APPLICATIONS =============

export const saveApplication = (application: JobApplication): void => {
  const applications = getApplications();
  applications.push(application);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
};

export const getApplications = (): JobApplication[] => {
  const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
  return data ? JSON.parse(data) : [];
};

export const updateApplicationStatus = (
  nullifier: string,
  status: JobApplication['status'],
  description?: string
): void => {
  const applications = getApplications();
  const appIndex = applications.findIndex(app => app.nullifier === nullifier);
  
  if (appIndex !== -1) {
    applications[appIndex].status = status;
    applications[appIndex].lastUpdate = new Date().toLocaleDateString();
    
    // Update timeline
    const timeline = applications[appIndex].timeline;
    const currentStepIndex = timeline.findIndex(step => step.status === 'current');
    
    if (currentStepIndex !== -1) {
      // Mark current step as completed
      timeline[currentStepIndex].status = 'completed';
      timeline[currentStepIndex].timestamp = new Date().toLocaleString();
      
      // Mark next step as current (if exists)
      if (currentStepIndex + 1 < timeline.length) {
        timeline[currentStepIndex + 1].status = 'current';
        timeline[currentStepIndex + 1].timestamp = new Date().toLocaleString();
        if (description) {
          timeline[currentStepIndex + 1].description = description;
        }
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }
};

export const deleteApplication = (nullifier: string): void => {
  const applications = getApplications();
  const filtered = applications.filter(app => app.nullifier !== nullifier);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(filtered));
};

// ============= WHISTLEBLOWER REPORTS =============

export const saveReport = (report: WhistleblowerReport): void => {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
};

export const getReports = (): WhistleblowerReport[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
  return data ? JSON.parse(data) : [];
};

export const updateReportStatus = (
  nullifier: string,
  status: WhistleblowerReport['status'],
  description?: string,
  rewardAmount?: string
): void => {
  const reports = getReports();
  const reportIndex = reports.findIndex(report => report.nullifier === nullifier);
  
  if (reportIndex !== -1) {
    reports[reportIndex].status = status;
    reports[reportIndex].lastUpdate = new Date().toLocaleDateString();
    
    if (rewardAmount) {
      reports[reportIndex].rewardAmount = rewardAmount;
    }
    
    // Update timeline
    const timeline = reports[reportIndex].timeline;
    const currentStepIndex = timeline.findIndex(step => step.status === 'current');
    
    if (currentStepIndex !== -1) {
      // Mark current step as completed
      timeline[currentStepIndex].status = 'completed';
      timeline[currentStepIndex].timestamp = new Date().toLocaleString();
      
      // Mark next step as current (if exists)
      if (currentStepIndex + 1 < timeline.length) {
        timeline[currentStepIndex + 1].status = 'current';
        timeline[currentStepIndex + 1].timestamp = new Date().toLocaleString();
        if (description) {
          timeline[currentStepIndex + 1].description = description;
        }
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }
};

export const deleteReport = (nullifier: string): void => {
  const reports = getReports();
  const filtered = reports.filter(report => report.nullifier !== nullifier);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered));
};

// ============= UTILITY FUNCTIONS =============

export const generateNullifier = (): string => {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  const hex = Array.from({ length: 64 }, randomHex).join('');
  return `0x${hex.substring(0, 18)}...${hex.substring(58, 64)}`;
};

export const generateCommitment = (): string => {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  const hex = Array.from({ length: 64 }, randomHex).join('');
  return `0x${hex}`;
};

export const generateEvidenceHash = (): string => {
  return generateCommitment();
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
  localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
  localStorage.removeItem(STORAGE_KEYS.REPORTS);
};

// ============= INITIAL SETUP =============

export const initializeStorage = (): void => {
  // Initialize credentials if not exists
  if (!getUserCredentials()) {
    saveUserCredentials(getDefaultCredentials());
  }
};