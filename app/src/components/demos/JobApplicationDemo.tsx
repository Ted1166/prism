import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveApplication, getUserCredentials, generateNullifier } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Lock, Sparkles, Send, Edit } from 'lucide-react';
import { Label } from '@radix-ui/react-label';

interface JobRequirements {
  jobId: string;
  title: string;
  requiredSkills: number[];
  minExperience: number;
  minEducation: number;
  minProjects: number;
}

interface UserCredential {
  skillLevels: number[];
  yearsExperience: number;
  educationLevel: number;
  totalProjects: number;
}

const SAMPLE_JOB: JobRequirements = {
  jobId: "42",
  title: "Senior Full Stack Developer",
  requiredSkills: [7, 7, 5, 4, 6],
  minExperience: 3,
  minEducation: 2,
  minProjects: 10,
};

const skillNames = ['React', 'TypeScript', 'Node.js', 'SQL', 'Docker'];
const educationNames = ['', 'High School', "Bachelor's", "Master's", 'PhD'];

export function JobApplicationDemo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'view' | 'generate' | 'submit' | 'success'>('view');
  const [progress, setProgress] = useState(0);
  const [userCreds, setUserCreds] = useState<UserCredential>({
    skillLevels: [8, 9, 7, 6, 8],
    yearsExperience: 5,
    educationLevel: 3,
    totalProjects: 20,
  });

  useEffect(() => {
    loadCredentials();
    
    const interval = setInterval(loadCredentials, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadCredentials = () => {
    const savedCreds = getUserCredentials();
    if (savedCreds) {
      setUserCreds({
        skillLevels: savedCreds.skills.map(s => s.level),
        yearsExperience: savedCreds.yearsExperience,
        educationLevel: getEducationLevel(savedCreds.education),
        totalProjects: savedCreds.projects,
      });
    }
  };

  const getEducationLevel = (education: string): number => {
    const levels: { [key: string]: number } = {
      'High School': 1,
      "Associate's Degree": 2,
      "Bachelor's Degree": 3,
      "Master's Degree": 4,
      'Doctorate': 5,
    };
    return levels[education] || 3;
  };

  const [proof, setProof] = useState<string>('');
  const [nullifier, setNullifier] = useState<string>('');

  const meetsRequirements = () => {
    return (
      userCreds.skillLevels.every((skill, i) => skill >= SAMPLE_JOB.requiredSkills[i]) &&
      userCreds.yearsExperience >= SAMPLE_JOB.minExperience &&
      userCreds.educationLevel >= SAMPLE_JOB.minEducation &&
      userCreds.totalProjects >= SAMPLE_JOB.minProjects
    );
  };

  const generateProof = async () => {
    setStep('generate');
    setProgress(0);
    
    // Simulate proof generation with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProof('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    setNullifier('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    setStep('submit');
  };

  const submitApplication = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const application = {
        id: Date.now().toString(),
        nullifier,
        jobTitle: SAMPLE_JOB.title,
        company: 'TechCorp',
        location: 'Remote',
        appliedDate: new Date().toLocaleDateString(),
        lastUpdate: 'Just now',
        status: 'submitted' as const,
        requirements: {
            minExperience: SAMPLE_JOB.minExperience,
            minEducation: educationNames[SAMPLE_JOB.minEducation],
            requiredSkills: skillNames.map((name, i) => ({
                name,
                minLevel: SAMPLE_JOB.requiredSkills[i]
            })),
        },
        timeline: [
            {id: '1', label: 'Submitted', status: 'current' as const, timestamp: new Date().toLocaleString()},
            {id: '2', label: 'Under Review', status: 'pending' as const },
            {id: '3', label: 'Interview', status: 'pending' as const },
            {id: '4', label: 'Offer', status: 'pending' as const },
            {id: '5', label: 'Accepted', status: 'pending' as const },
        ],
    };
    saveApplication(application);

    toast({
        title: "✓ Application Submitted!",
        description: "YOour anonymous application has been recorded",
    });

    setStep('success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {step === 'view' && (
        <>
            {/* ← ADD: Quick edit button at the top */}
            <div className="flex justify-end mb-4">
                <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/my-applications')}
                className="gap-2"
                >
                <Edit className="w-4 h-4" />
                Edit My Credentials
                </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
            {/* Job Requirements */}
            <Card className="border-primary/20 shadow-glow-cyan">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Job Posting
                </CardTitle>
                <CardDescription>Public job requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-lg mb-3">{SAMPLE_JOB.title}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary">Required Skills (minimum):</p>
                    {skillNames.map((name, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm">{name}</span>
                        <Badge variant="outline">{SAMPLE_JOB.requiredSkills[i]}/10</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="text-sm font-medium">{SAMPLE_JOB.minExperience}+ years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Education</span>
                    <span className="text-sm font-medium">{educationNames[SAMPLE_JOB.minEducation]}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projects</span>
                    <span className="text-sm font-medium">{SAMPLE_JOB.minProjects}+</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Credentials */}
            <Card className="border-accent/20 shadow-glow-emerald">
              <CardHeader>
                <CardTitle className="text-accent flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Your Credentials
                </CardTitle>
                <CardDescription>
                  Private - Only you see this
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-accent">Your Skills:</p>
                  {skillNames.map((name, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{name}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={userCreds.skillLevels[i] >= SAMPLE_JOB.requiredSkills[i] ? "default" : "destructive"}
                          className="min-w-[50px] justify-center"
                        >
                          {userCreds.skillLevels[i]}/10
                        </Badge>
                        {userCreds.skillLevels[i] >= SAMPLE_JOB.requiredSkills[i] ? (
                          <CheckCircle className="w-4 h-4 text-accent" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{userCreds.yearsExperience} years</span>
                      {userCreds.yearsExperience >= SAMPLE_JOB.minExperience ? (
                        <CheckCircle className="w-4 h-4 text-accent" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Education</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{educationNames[userCreds.educationLevel]}</span>
                      {userCreds.educationLevel >= SAMPLE_JOB.minEducation ? (
                        <CheckCircle className="w-4 h-4 text-accent" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Projects</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{userCreds.totalProjects}</span>
                      {userCreds.totalProjects >= SAMPLE_JOB.minProjects ? (
                        <CheckCircle className="w-4 h-4 text-accent" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>

                {meetsRequirements() && (
                  <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg text-accent text-sm font-medium text-center">
                    ✓ You meet all requirements!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={generateProof}
            disabled={!meetsRequirements()}
            variant="hero"
            size="lg"
            className="w-full text-lg"
          >
            <Lock className="w-5 h-5 mr-2" />
            Generate Anonymous Proof & Apply
          </Button>
        </>
      )}

      {step === 'generate' && (
        <Card className="border-primary/20">
          <CardContent className="py-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xl font-semibold mb-2">Generating Zero-Knowledge Proof...</p>
              <p className="text-sm text-muted-foreground">
                Proving you meet requirements without revealing identity
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'submit' && (
        <>
          <Card className="border-primary/20 shadow-glow-cyan">
            <CardHeader>
              <CardTitle className="text-primary">Proof Generated Successfully!</CardTitle>
              <CardDescription>Your anonymous application is ready to submit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Application Nullifier:</p>
                <code className="text-xs bg-muted p-3 rounded-lg block overflow-x-auto font-mono">
                  {nullifier}
                </code>
                <p className="text-xs text-muted-foreground mt-1">Prevents duplicate applications</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Zero-Knowledge Proof (truncated):</p>
                <code className="text-xs bg-muted p-3 rounded-lg block overflow-x-auto font-mono">
                  {proof.slice(0, 100)}...
                </code>
                <p className="text-xs text-muted-foreground mt-1">Proves qualifications without revealing data</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">What Employer Sees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Anonymous candidate meets all requirements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Valid credential commitment verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>No previous application detected</span>
                </div>
                <div className="pt-3 mt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="line-through">Candidate name</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="line-through">Previous employers</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="line-through">University attended</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={submitApplication}
            variant="hero"
            size="lg"
            className="w-full text-lg"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Anonymous Application to Starknet
          </Button>
        </>
      )}

      {step === 'success' && (
        <Card className="border-accent/30 shadow-glow-emerald">
          <CardContent className="py-12 text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <div>
              <h3 className="text-3xl font-bold text-accent mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground">
                Your anonymous application has been recorded on Starknet
              </p>
            </div>
            <div className="inline-block bg-card border rounded-lg p-6 text-left space-y-3 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-accent font-medium">Verified ✓</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Identity:</span>
                <span className="text-primary font-medium">Hidden 🔒</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Nullifier:</span>
                <span className="text-primary font-mono text-xs">{nullifier.slice(0, 16)}...</span>
              </div>
            </div>
            <div className="flex gap-3">
            <Button 
                onClick={() => navigate('/my-applications')}
                variant="hero"
                size="lg"
                className="flex-1"
            >
                Track Application Status
            </Button>
            <Button 
                onClick={() => setStep('view')}
                variant="outline"
                size="lg"
                className="flex-1"
            >
                Submit Another
            </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}