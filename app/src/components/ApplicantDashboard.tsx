import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timeline, CompactTimeline } from '@/components/Timeline';
import type { TimelineStep } from '@/components/Timeline';
import { Navigation } from '@/components/Navigation';
import { CredentialsEditor } from '@/components/CredentialsEditor';
import { 
  getApplications, 
  deleteApplication,
  type JobApplication 
} from '@/lib/storage';
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  Eye, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Edit,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function ApplicantDashboard() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'rejected'>('all');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);

  // Load applications from localStorage
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const apps = getApplications();
    setApplications(apps);
  };

  const filteredApplications = applications.filter(app => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return app.status !== 'rejected';
    if (selectedFilter === 'rejected') return app.status === 'rejected';
    return true;
  });

  const handleWithdraw = (nullifier: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      deleteApplication(nullifier);
      loadApplications();
      toast({
        title: "Application Withdrawn",
        description: "Your application has been withdrawn successfully.",
      });
    }
  };

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'interview':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'offer':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'accepted':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: JobApplication['status']) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12 pt-24">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">My Applications</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Track your anonymous job applications
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowCredentials(!showCredentials)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Credentials
            </Button>
          </div>

          {/* Credentials Editor (Collapsible) */}
          {showCredentials && (
            <div className="mb-8">
              <CredentialsEditor />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{applications.length}</div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">
                  {applications.filter(a => a.status === 'under_review').length}
                </div>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-500">
                  {applications.filter(a => a.status === 'interview').length}
                </div>
                <p className="text-sm text-muted-foreground">Interviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-accent">
                  {applications.filter(a => a.status === 'offer' || a.status === 'accepted').length}
                </div>
                <p className="text-sm text-muted-foreground">Offers</p>
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
                All ({applications.length})
              </Button>
              <Button
                variant={selectedFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('active')}
              >
                Active ({applications.filter(a => a.status !== 'rejected').length})
              </Button>
              <Button
                variant={selectedFilter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('rejected')}
              >
                Rejected ({applications.filter(a => a.status === 'rejected').length})
              </Button>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="border-primary/20 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{application.jobTitle}</CardTitle>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                      <CardDescription className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {application.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied: {application.appliedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Updated: {application.lastUpdate}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedApp(expandedApp === application.id ? null : application.id)}
                    >
                      {expandedApp === application.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Compact timeline always visible */}
                  <CompactTimeline steps={application.timeline} />

                  {/* Expanded details */}
                  {expandedApp === application.id && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      {/* Full Timeline */}
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Detailed Timeline
                        </h4>
                        <Timeline steps={application.timeline} type="application" />
                      </div>

                      {/* Nullifier Info */}
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm">Application Nullifier</h4>
                        <code className="text-xs text-muted-foreground break-all">
                          {application.nullifier}
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                          Use this nullifier to track your application on-chain
                        </p>
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
                        {application.status !== 'accepted' && application.status !== 'rejected' && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="gap-2 ml-auto"
                            onClick={() => handleWithdraw(application.nullifier)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredApplications.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedFilter === 'all' 
                      ? "You haven't submitted any applications yet" 
                      : `No ${selectedFilter} applications`}
                  </p>
                  <Button variant="default" asChild>
                    <Link to="/demo">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Application
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