import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveReport, generateNullifier, generateEvidenceHash, generateCommitment } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, Lock, Upload, Send, Shield } from 'lucide-react';

interface ReportData {
  companyId: string;
  incidentType: number;
  incidentDate: string;
  severity: number;
  evidenceHash: string;
  witnessCount: number;
}

const INCIDENT_TYPES = [
  '',
  'Financial Fraud',
  'Sexual Harassment',
  'Safety Violation',
  'Data Breach',
  'Environmental',
  'Discrimination',
  'Retaliation',
  'Insider Trading',
  'Product Safety',
  'Other Misconduct'
];

const SEVERITY_LABELS = ['', 'Minor', 'Moderate', 'Serious', 'Severe', 'Critical'];

export function WhistleblowerDemo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'generate' | 'submit' | 'success'>('form');
  const [progress, setProgress] = useState(0);
  const [reportData, setReportData] = useState<ReportData>({
    companyId: 'ACME-CORP-2024',
    incidentType: 1,
    incidentDate: '2024-11-15',
    severity: 4,
    evidenceHash: '',
    witnessCount: 2,
  });
  const [reportNullifier, setReportNullifier] = useState('');
  const [reporterCommitment, setReporterCommitment] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const hash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      setReportData({ ...reportData, evidenceHash: hash });
    }
  };

  const generateProof = async () => {
    setStep('generate');
    setProgress(0);
    
    const messages = [
      'Verifying employment history...',
      'Hashing evidence securely...',
      'Creating cryptographic commitments...'
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev % 33 === 0 && msgIndex < messages.length - 1) {
          msgIndex++;
        }
        return prev + 8;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setReportNullifier('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    setReporterCommitment('0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''));
    setStep('submit');
  };

  const submitReport = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const report = {
        id: Date.now().toString(),
        nullifier: reportNullifier,
        reporterCommitment: reporterCommitment,
        incidentType: INCIDENT_TYPES[reportData.incidentType],
        severity: reportData.severity as 1 | 2 | 3 | 4 | 5 ,
        description: `${INCIDENT_TYPES[reportData.incidentType]} incident on ${reportData.incidentDate}`,
        submittedDate: new Date().toLocaleDateString(),
        lastUpdate: 'Just now',
        status: 'submitted' as const,
        witnessCount: reportData.witnessCount,
        evidenceHash: reportData.evidenceHash || generateEvidenceHash(),
        timeline: [
            {id: '1', label: 'Submitted', status: 'current' as const, timestamp: new Date().toLocaleString() },
            {id: '2', label: 'Acknowledged', status: 'pending' as const },
            {id: '3', label: 'Under Investigation', status: 'pending' as const },
            {id: '4', label: 'Verification', status: 'pending' as const },
            {id: '5', label: 'Reward Available', status: 'pending' as const },
        ],
    };
    saveReport(report);

    toast({
        title: "🛡️ Report Submitted Safely!",
        description: "Your anonymous report has been recorded.",
    });

    setStep('success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {step === 'form' && (
        <>
          <Card className="border-destructive/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Report Incident Anonymously
              </CardTitle>
              <CardDescription>
                Protected by zero-knowledge proofs - your identity will never be revealed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Incident Type</label>
                  <select
                    value={reportData.incidentType}
                    onChange={(e) => setReportData({ ...reportData, incidentType: parseInt(e.target.value) })}
                    className="w-full p-2 rounded-md border bg-background"
                  >
                    {INCIDENT_TYPES.slice(1).map((type, i) => (
                      <option key={i + 1} value={i + 1}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Incident Date</label>
                  <input
                    type="date"
                    value={reportData.incidentDate}
                    onChange={(e) => setReportData({ ...reportData, incidentDate: e.target.value })}
                    className="w-full p-2 rounded-md border bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity: {SEVERITY_LABELS[reportData.severity]}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reportData.severity}
                  onChange={(e) => setReportData({ ...reportData, severity: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minor</span>
                  <span>Moderate</span>
                  <span>Serious</span>
                  <span>Severe</span>
                  <span>Critical</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Evidence (Optional)</label>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="evidence-upload"
                    accept=".pdf,.jpg,.png,.doc,.docx"
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {fileName || 'Click to upload documents, images, or PDFs'}
                    </p>
                    {reportData.evidenceHash && (
                      <p className="text-xs text-accent mt-2">
                        ✓ Evidence hashed securely
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Witnesses</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={reportData.witnessCount}
                  onChange={(e) => setReportData({ ...reportData, witnessCount: parseInt(e.target.value) })}
                  className="w-full p-2 rounded-md border bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Your identity will be completely hidden</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Employment verified without revealing name</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Evidence stored as cryptographic hash</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Can claim rewards anonymously if verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Nullifier prevents duplicate reports</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={generateProof}
            variant="hero"
            size="lg"
            className="w-full text-lg"
          >
            <Lock className="w-5 h-5 mr-2" />
            Generate Anonymous Report Proof
          </Button>
        </>
      )}

      {step === 'generate' && (
        <Card className="border-primary/20">
          <CardContent className="py-12 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Lock className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div>
              <p className="text-xl font-semibold mb-2">Generating Anonymous Report...</p>
              <p className="text-sm text-muted-foreground">
                ⚡ Verifying employment history...<br/>
                ⚡ Hashing evidence securely...<br/>
                ⚡ Creating cryptographic commitments...
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
              <CardTitle className="text-primary">Anonymous Report Ready!</CardTitle>
              <CardDescription>Your identity is fully protected</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Report Nullifier:</p>
                <code className="text-xs bg-muted p-3 rounded-lg block overflow-x-auto font-mono">
                  {reportNullifier}
                </code>
                <p className="text-xs text-muted-foreground mt-1">Unique identifier preventing duplicate reports</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Reporter Commitment:</p>
                <code className="text-xs bg-muted p-3 rounded-lg block overflow-x-auto font-mono">
                  {reporterCommitment}
                </code>
                <p className="text-xs text-muted-foreground mt-1">Save this to claim rewards later (while staying anonymous)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">What Company Sees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Report from verified employee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Incident: {INCIDENT_TYPES[reportData.incidentType]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Severity: {SEVERITY_LABELS[reportData.severity]}</span>
                </div>
                {reportData.evidenceHash && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" />
                    <span>Evidence hash: {reportData.evidenceHash.slice(0, 16)}...</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Witnesses: {reportData.witnessCount}</span>
                </div>
                <div className="pt-3 mt-3 border-t space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="line-through">Reporter name</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="line-through">Department</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="line-through">Employee ID</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={submitReport}
            variant="hero"
            size="lg"
            className="w-full text-lg"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Anonymous Report to Starknet
          </Button>
        </>
      )}

      {step === 'success' && (
        <Card className="border-accent/30 shadow-glow-emerald">
          <CardContent className="py-12 text-center space-y-6">
            <div className="text-6xl mb-4">🛡️</div>
            <div>
              <h3 className="text-3xl font-bold text-accent mb-2">Report Submitted Safely!</h3>
              <p className="text-muted-foreground">
                Your anonymous report has been recorded on Starknet
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                💡 Important: Save Your Reporter Commitment
              </p>
              <code className="text-xs bg-muted p-2 rounded block overflow-x-auto font-mono">
                {reporterCommitment}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                You'll need this to claim rewards if your report is verified
              </p>
            </div>

            <div className="inline-block bg-card border rounded-lg p-6 text-left space-y-3 text-sm">
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">Pending Review</Badge>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Your Identity:</span>
                <span className="text-primary font-medium">Protected 🔒</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Report Type:</span>
                <span className="font-medium">{INCIDENT_TYPES[reportData.incidentType]}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">Severity:</span>
                <Badge variant="destructive">{SEVERITY_LABELS[reportData.severity]}</Badge>
              </div>
            </div>

            <div className="flex gap-3">
            <Button 
                onClick={() => navigate('/my-reports')}
                variant="hero"
                size="lg"
                className="flex-1"
            >
                Track Report Status
            </Button>
            <Button 
                onClick={() => setStep('form')}
                variant="outline"
                size="lg"
                className="flex-1"
            >
                Submit Another Report
            </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}