import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigation } from './Navigation';
import { 
  getApplications, 
  getReports, 
  updateApplicationStatus,
  updateReportStatus,
  type JobApplication,
  type WhistleblowerReport
} from '@/lib/storage';
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
  FileText,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminDashboard() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [reports, setReports] = useState<WhistleblowerReport[]>([]);
  const [appFilter, setAppFilter] = useState<'all' | 'new' | 'reviewing'>('all');
  const [reportFilter, setReportFilter] = useState<'all' | 'new' | 'investigating'>('all');

  // Load data from localStorage
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 seconds to show new submissions
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setApplications(getApplications());
    setReports(getReports());
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-destructive';
    if (severity === 3) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getSeverityLabel = (severity: number) => {
    const labels = ['', 'Minor', 'Moderate', 'Serious', 'Severe', 'Critical'];
    return labels[severity];
  };

  // Application actions
  const handleAcceptApplication = (nullifier: string, jobTitle: string) => {
    updateApplicationStatus(nullifier, 'offer', `Offer extended for ${jobTitle}`);
    loadData();
    toast({
      title: "Application Accepted",
      description: "Offer extended to candidate. They will be notified.",
    });
  };

  const handleScheduleInterview = (nullifier: string) => {
    updateApplicationStatus(nullifier, 'interview', 'Interview scheduled for next week');
    loadData();
    toast({
      title: "Interview Scheduled",
      description: "Candidate will see the interview notification.",
    });
  };

  const handleRejectApplication = (nullifier: string) => {
    if (confirm('Are you sure you want to reject this application?')) {
      updateApplicationStatus(nullifier, 'rejected', 'Position filled by another candidate');
      loadData();
      toast({
        title: "Application Rejected",
        description: "Candidate has been notified.",
        variant: "destructive",
      });
    }
  };

  const handleReviewApplication = (nullifier: string) => {
    updateApplicationStatus(nullifier, 'under_review', 'Application is being reviewed by hiring team');
    loadData();
    toast({
      title: "Status Updated",
      description: "Application moved to under review.",
    });
  };

  // Report actions
  const handleStartInvestigation = (nullifier: string, incidentType: string) => {
    updateReportStatus(nullifier, 'under_investigation', `Investigation started for ${incidentType}`);
    loadData();
    toast({
      title: "Investigation Started",
      description: "Reporter will be notified of investigation progress.",
    });
  };

  const handleVerifyReport = (nullifier: string) => {
    const rewardAmount = '5,000 USDC'; // You can make this dynamic
    updateReportStatus(nullifier, 'verified', 'Report verified by independent audit', rewardAmount);
    loadData();
    toast({
      title: "Report Verified",
      description: `Reward of ${rewardAmount} is now available for the reporter.`,
    });
  };

  const handleDismissReport = (nullifier: string) => {
    if (confirm('Are you sure you want to dismiss this report?')) {
      updateReportStatus(nullifier, 'dismissed', 'Insufficient evidence to verify claims');
      loadData();
      toast({
        title: "Report Dismissed",
        description: "Reporter has been notified.",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    if (appFilter === 'all') return true;
    if (appFilter === 'new') return app.status === 'submitted';
    if (appFilter === 'reviewing') return app.status === 'under_review';
    return true;
  });

  const filteredReports = reports.filter(report => {
    if (reportFilter === 'all') return true;
    if (reportFilter === 'new') return report.status === 'submitted';
    if (reportFilter === 'investigating') return report.status === 'under_investigation';
    return true;
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
                    <div className="text-2xl font-bold">{applications.length}</div>
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
                      {applications.filter(a => a.status === 'submitted').length}
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
                    <div className="text-2xl font-bold">{reports.length}</div>
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
                      {reports.filter(r => r.status === 'submitted').length}
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
                Applications ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <Shield className="w-4 h-4" />
                Whistleblower Reports ({reports.length})
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
                    All ({applications.length})
                  </Button>
                  <Button
                    variant={appFilter === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppFilter('new')}
                  >
                    New ({applications.filter(a => a.status === 'submitted').length})
                  </Button>
                  <Button
                    variant={appFilter === 'reviewing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppFilter('reviewing')}
                  >
                    Reviewing ({applications.filter(a => a.status === 'under_review').length})
                  </Button>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No applications yet</h3>
                      <p className="text-muted-foreground">
                        Applications will appear here when candidates submit them
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredApplications.map((application) => (
                    <Card key={application.id} className="border-primary/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">
                                Anonymous Candidate #{application.id.slice(-4)}
                              </CardTitle>
                              {application.status === 'submitted' && (
                                <Badge className="bg-blue-500 text-white">New</Badge>
                              )}
                              {application.status === 'under_review' && (
                                <Badge className="bg-yellow-500 text-white">Reviewing</Badge>
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
                                <span>Experience: {application.requirements.minExperience}+ years</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-accent" />
                                <span>Education: {application.requirements.minEducation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-accent" />
                                <span>Skills: {application.requirements.requiredSkills.map(s => s.name).join(', ')}</span>
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
                        <div className="flex gap-3 pt-2 flex-wrap">
                          {application.status === 'submitted' && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleReviewApplication(application.nullifier)}
                            >
                              <Eye className="w-4 h-4" />
                              Start Review
                            </Button>
                          )}
                          
                          {(application.status === 'under_review' || application.status === 'submitted') && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => handleAcceptApplication(application.nullifier, application.jobTitle)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept & Make Offer
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => handleScheduleInterview(application.nullifier)}
                              >
                                <Calendar className="w-4 h-4" />
                                Schedule Interview
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Request Info
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="gap-2 ml-auto"
                                onClick={() => handleRejectApplication(application.nullifier)}
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </Button>
                            </>
                          )}

                          {(application.status === 'interview' || application.status === 'offer') && (
                            <div className="w-full p-3 bg-accent/10 rounded-lg text-sm text-accent">
                              Status: {application.status === 'interview' ? 'Interview Scheduled' : 'Offer Extended'}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
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
                    All ({reports.length})
                  </Button>
                  <Button
                    variant={reportFilter === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportFilter('new')}
                  >
                    New ({reports.filter(r => r.status === 'submitted').length})
                  </Button>
                  <Button
                    variant={reportFilter === 'investigating' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportFilter('investigating')}
                  >
                    Investigating ({reports.filter(r => r.status === 'under_investigation').length})
                  </Button>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No reports yet</h3>
                      <p className="text-muted-foreground">
                        Whistleblower reports will appear here when submitted
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredReports.map((report) => (
                    <Card key={report.id} className="border-accent/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <CardTitle className="text-xl flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                Whistleblower Report #{report.id.slice(-4)}
                              </CardTitle>
                              <Badge className={`${getSeverityColor(report.severity)} text-white`}>
                                {getSeverityLabel(report.severity)}
                              </Badge>
                              {report.status === 'submitted' && (
                                <Badge className="bg-destructive text-white">New</Badge>
                              )}
                              {report.status === 'under_investigation' && (
                                <Badge className="bg-purple-500 text-white">Investigating</Badge>
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
                        <div className="flex gap-3 pt-2 flex-wrap">
                          {report.status === 'submitted' && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => handleStartInvestigation(report.nullifier, report.incidentType)}
                            >
                              <UserCheck className="w-4 h-4" />
                              Start Investigation
                            </Button>
                          )}
                          
                          {(report.status === 'under_investigation' || report.status === 'submitted') && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="gap-2 bg-accent"
                                onClick={() => handleVerifyReport(report.nullifier)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Verify Report
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Evidence
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Generate Report
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="gap-2 ml-auto"
                                onClick={() => handleDismissReport(report.nullifier)}
                              >
                                <XCircle className="w-4 h-4" />
                                Dismiss
                              </Button>
                            </>
                          )}

                          {report.status === 'verified' && (
                            <div className="w-full p-3 bg-accent/10 rounded-lg text-sm text-accent">
                              ✓ Report Verified - Reward: {report.rewardAmount}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}