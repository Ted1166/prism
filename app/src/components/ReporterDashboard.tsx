import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timeline } from '@/components/Timeline';
import type { TimelineStep } from '@/components/Timeline';
import { Navigation } from '@/components/Navigation';
import { 
  getReports,
  type WhistleblowerReport
} from '@/lib/storage';
import { 
  Shield, 
  AlertTriangle,
  Lock, 
  Clock, 
  Eye, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Award,
  Copy,
  CheckCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function ReporterDashboard() {
  const { toast } = useToast();
  const [reports, setReports] = useState<WhistleblowerReport[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'verified' | 'dismissed'>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [copiedCommitment, setCopiedCommitment] = useState<string | null>(null);

  // Load reports from localStorage
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const reps = getReports();
    setReports(reps);
  };

  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return ['submitted', 'pending', 'under_investigation'].includes(report.status);
    if (selectedFilter === 'verified') return report.status === 'verified' || report.status === 'reward_available';
    if (selectedFilter === 'dismissed') return report.status === 'dismissed';
    return true;
  });

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-destructive text-destructive-foreground';
    if (severity === 3) return 'bg-orange-500 text-white';
    return 'bg-yellow-500 text-white';
  };

  const getSeverityLabel = (severity: number) => {
    const labels = ['', 'Minor', 'Moderate', 'Serious', 'Severe', 'Critical'];
    return labels[severity];
  };

  const getStatusColor = (status: WhistleblowerReport['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'under_investigation':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'verified':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'reward_available':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'dismissed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: WhistleblowerReport['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommitment(id);
    toast({
      title: "✓ Copied to Clipboard",
      description: "Reporter commitment has been copied.",
    });
    setTimeout(() => setCopiedCommitment(null), 2000);
  };

  const totalRewards = reports
    .filter(r => r.rewardAmount)
    .reduce((acc, r) => acc + parseFloat(r.rewardAmount?.replace(/[^0-9.]/g, '') || '0'), 0);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12 pt-24">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-accent" />
              <h1 className="text-4xl font-bold">My Reports</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Track your anonymous whistleblower reports
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-500">
                  {reports.filter(r => r.status === 'under_investigation').length}
                </div>
                <p className="text-sm text-muted-foreground">Under Investigation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent">
                  {reports.filter(r => r.status === 'verified').length}
                </div>
                <p className="text-sm text-muted-foreground">Verified</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">
                  {totalRewards.toLocaleString()} USDC
                </div>
                <p className="text-sm text-muted-foreground">Available Rewards</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All ({reports.length})
              </Button>
              <Button
                variant={selectedFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('active')}
              >
                Active ({reports.filter(r => ['submitted', 'pending', 'under_investigation'].includes(r.status)).length})
              </Button>
              <Button
                variant={selectedFilter === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('verified')}
              >
                Verified ({reports.filter(r => r.status === 'verified' || r.status === 'reward_available').length})
              </Button>
              <Button
                variant={selectedFilter === 'dismissed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('dismissed')}
              >
                Dismissed ({reports.filter(r => r.status === 'dismissed').length})
              </Button>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="border-accent/20 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          {report.incidentType}
                        </CardTitle>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusLabel(report.status)}
                        </Badge>
                        <Badge className={getSeverityColor(report.severity)}>
                          Severity: {getSeverityLabel(report.severity)}
                        </Badge>
                      </div>
                      <CardDescription className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Submitted: {report.submittedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            Updated: {report.lastUpdate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {report.witnessCount} witness{report.witnessCount !== 1 ? 'es' : ''}
                          </span>
                        </div>
                        {report.rewardAmount && (
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-green-500" />
                            <span className="text-green-500 font-medium">
                              Reward Available: {report.rewardAmount}
                            </span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    >
                      {expandedReport === report.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          report.status === 'verified' || report.status === 'reward_available' ? 'bg-accent' :
                          report.status === 'under_investigation' ? 'bg-purple-500' :
                          report.status === 'dismissed' ? 'bg-destructive' :
                          'bg-yellow-500'
                        }`}
                        style={{ 
                          width: `${
                            report.status === 'verified' || report.status === 'reward_available' ? '100' :
                            report.status === 'under_investigation' ? '60' :
                            report.status === 'dismissed' ? '100' :
                            '40'
                          }%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedReport === report.id && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      {/* Full Timeline */}
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Investigation Timeline
                        </h4>
                        <Timeline steps={report.timeline} type="report" />
                      </div>

                      {/* Reporter Commitment - IMPORTANT */}
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Lock className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1 text-sm text-yellow-500">
                              ⚠️ Important: Save Your Reporter Commitment
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              You'll need this to claim rewards anonymously. Keep it safe!
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs bg-background p-2 rounded break-all">
                                {report.reporterCommitment}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(report.reporterCommitment, report.id)}
                              >
                                {copiedCommitment === report.id ? (
                                  <CheckCircle className="w-4 h-4 text-accent" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Evidence Info */}
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <div>
                          <h4 className="font-semibold mb-1 text-sm">Report Nullifier</h4>
                          <code className="text-xs text-muted-foreground break-all">
                            {report.nullifier}
                          </code>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1 text-sm">Evidence Hash</h4>
                          <code className="text-xs text-muted-foreground break-all">
                            {report.evidenceHash}
                          </code>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View on Starknet
                        </Button>
                        {report.rewardAmount && (
                          <Button variant="default" size="sm" className="gap-2 ml-auto bg-accent hover:bg-accent/90">
                            <Award className="w-4 h-4" />
                            Claim {report.rewardAmount}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredReports.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No reports found</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedFilter === 'all' 
                      ? "You haven't submitted any reports yet" 
                      : `No ${selectedFilter} reports`}
                  </p>
                  <Button variant="default" asChild>
                    <Link to="/demo">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Report
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}