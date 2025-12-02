import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation } from './Navigation';
import { 
  Briefcase, 
  Shield,
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  UserCheck,
  AlertTriangle,
  Calendar,
  Filter,
  Search,
  FileText,
  MessageSquare
} from 'lucide-react';

interface AnonymousApplication {
  id: string;
  nullifier: string;
  jobTitle: string;
  appliedDate: string;
  status: 'new' | 'reviewing' | 'interview_scheduled' | 'offer_made';
  meetsRequirements: boolean;
  qualifications: {
    experience: string;
    education: string;
    skills: string[];
    verified: boolean;
  };
}

interface AnonymousReport {
  id: string;
  nullifier: string;
  incidentType: string;
  severity: 1 | 2 | 3 | 4 | 5;
  submittedDate: string;
  status: 'new' | 'investigating' | 'verified' | 'dismissed';
  evidenceHash: string;
  witnessCount: number;
  verifiedEmployee: boolean;
}

// Mock data
const MOCK_APPLICATIONS: AnonymousApplication[] = [
  {
    id: '1',
    nullifier: '0xed81187c68a8e7...a1b2c3',
    jobTitle: 'Senior Full Stack Developer',
    appliedDate: 'Dec 1, 2024',
    status: 'new',
    meetsRequirements: true,
    qualifications: {
      experience: '≥ 5 years (Verified)',
      education: "Bachelor's degree or higher (Verified)",
      skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Docker'],
      verified: true,
    },
  },
  {
    id: '2',
    nullifier: '0x9c2f4e8a3b1d...d4e5f6',
    jobTitle: 'Product Designer',
    appliedDate: 'Nov 30, 2024',
    status: 'reviewing',
    meetsRequirements: true,
    qualifications: {
      experience: '≥ 3 years (Verified)',
      education: "Master's degree (Verified)",
      skills: ['Figma', 'UI/UX', 'Prototyping', 'Design Systems'],
      verified: true,
    },
  },
  {
    id: '3',
    nullifier: '0x7a8d5e9b2c4f...g7h8i9',
    jobTitle: 'Marketing Manager',
    appliedDate: 'Nov 28, 2024',
    status: 'interview_scheduled',
    meetsRequirements: true,
    qualifications: {
      experience: '≥ 4 years (Verified)',
      education: "Bachelor's degree (Verified)",
      skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
      verified: true,
    },
  },
];

const MOCK_REPORTS: AnonymousReport[] = [
  {
    id: '1',
    nullifier: '0x9f2a8e1c4b7d...x1y2z3',
    incidentType: 'Financial Fraud',
    severity: 4,
    submittedDate: 'Dec 1, 2024',
    status: 'investigating',
    evidenceHash: '0x8d2f7a3e9c1b...p7q8r9',
    witnessCount: 2,
    verifiedEmployee: true,
  },
  {
    id: '2',
    nullifier: '0x3c8d1f5a9e7b...a2b3c4',
    incidentType: 'Safety Violation',
    severity: 5,
    submittedDate: 'Nov 28, 2024',
    status: 'new',
    evidenceHash: '0x2b8f9d4e1a7c...g8h9i0',
    witnessCount: 5,
    verifiedEmployee: true,
  },
  {
    id: '3',
    nullifier: '0x5e7c2a9f4d8b...j1k2l3',
    incidentType: 'Discrimination',
    severity: 3,
    submittedDate: 'Nov 26, 2024',
    status: 'verified',
    evidenceHash: '0x6f3d9e2a8c1b...p7q8r9',
    witnessCount: 1,
    verifiedEmployee: true,
  },
];

export function AdminDashboard() {
  const [appFilter, setAppFilter] = useState<'all' | 'new' | 'reviewing'>('all');
  const [reportFilter, setReportFilter] = useState<'all' | 'new' | 'investigating'>('all');

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-destructive';
    if (severity === 3) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getSeverityLabel = (severity: number) => {
    const labels = ['', 'Minor', 'Moderate', 'Serious', 'Severe', 'Critical'];
    return labels[severity];
  };

  const filteredApplications = MOCK_APPLICATIONS.filter(app => {
    if (appFilter === 'all') return true;
    return app.status === appFilter;
  });

  const filteredReports = MOCK_REPORTS.filter(report => {
    if (reportFilter === 'all') return true;
    return report.status === reportFilter;
  });

  return (
    <>
    <Navigation/>
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12 pt-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Manage anonymous applications and whistleblower reports
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{MOCK_APPLICATIONS.length}</div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {MOCK_APPLICATIONS.filter(a => a.status === 'new').length}
                  </div>
                  <p className="text-sm text-muted-foreground">New Applications</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{MOCK_REPORTS.length}</div>
                  <p className="text-sm text-muted-foreground">Reports</p>
                </div>
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-destructive">
                    {MOCK_REPORTS.filter(r => r.status === 'new').length}
                  </div>
                  <p className="text-sm text-muted-foreground">New Reports</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Shield className="w-4 h-4" />
              Whistleblower Reports
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-2">
                <Button
                  variant={appFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAppFilter('all')}
                >
                  All ({MOCK_APPLICATIONS.length})
                </Button>
                <Button
                  variant={appFilter === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAppFilter('new')}
                >
                  New ({MOCK_APPLICATIONS.filter(a => a.status === 'new').length})
                </Button>
                <Button
                  variant={appFilter === 'reviewing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAppFilter('reviewing')}
                >
                  Reviewing ({MOCK_APPLICATIONS.filter(a => a.status === 'reviewing').length})
                </Button>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            Anonymous Candidate #{application.id}
                          </CardTitle>
                          {application.status === 'new' && (
                            <Badge className="bg-blue-500 text-white">New</Badge>
                          )}
                        </div>
                        <CardDescription className="space-y-1">
                          <p className="text-base">Applied for: <span className="font-medium">{application.jobTitle}</span></p>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            {application.appliedDate}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Qualifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          What You Can See (Verified)
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Meets all requirements</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>{application.qualifications.experience}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>{application.qualifications.education}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Skills: {application.qualifications.skills.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Zero-knowledge proof verified on Starknet</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                          What's Hidden (Anonymous)
                        </h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Name</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Previous employers</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>University name</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Exact years of experience</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Personal information</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nullifier */}
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Application Nullifier</p>
                      <code className="text-xs break-all">{application.nullifier}</code>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="default" size="sm" className="gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Accept Application
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Schedule Interview
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Request Info
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2 ml-auto">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <div className="flex gap-2">
                <Button
                  variant={reportFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportFilter('all')}
                >
                  All ({MOCK_REPORTS.length})
                </Button>
                <Button
                  variant={reportFilter === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportFilter('new')}
                >
                  New ({MOCK_REPORTS.filter(r => r.status === 'new').length})
                </Button>
                <Button
                  variant={reportFilter === 'investigating' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReportFilter('investigating')}
                >
                  Investigating ({MOCK_REPORTS.filter(r => r.status === 'investigating').length})
                </Button>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="border-accent/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Whistleblower Report #{report.id}
                          </CardTitle>
                          <Badge className={`${getSeverityColor(report.severity)} text-white`}>
                            {getSeverityLabel(report.severity)}
                          </Badge>
                          {report.status === 'new' && (
                            <Badge className="bg-destructive text-white">New</Badge>
                          )}
                        </div>
                        <CardDescription className="space-y-1">
                          <p className="text-base">Type: <span className="font-medium">{report.incidentType}</span></p>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4" />
                            {report.submittedDate}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Report Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          Verified Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Reporter is a verified employee</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Incident type: {report.incidentType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Severity: {getSeverityLabel(report.severity)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>{report.witnessCount} witness{report.witnessCount !== 1 ? 'es' : ''} mentioned</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-accent" />
                            <span>Evidence securely hashed</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                          Protected Information
                        </h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Reporter name</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Department</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Employee ID</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Manager information</span>
                          </div>
                          <div className="flex items-center gap-2 line-through">
                            <XCircle className="w-4 h-4" />
                            <span>Any identifying details</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Evidence Hash */}
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Report Nullifier</p>
                        <code className="text-xs break-all">{report.nullifier}</code>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Evidence Hash</p>
                        <code className="text-xs break-all">{report.evidenceHash}</code>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="default" size="sm" className="gap-2">
                        <UserCheck className="w-4 h-4" />
                        Start Investigation
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View Evidence
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Generate Report
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-2 ml-auto">
                        <XCircle className="w-4 h-4" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}