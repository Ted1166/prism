import { CheckCircle, Circle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type TimelineStatus = 'completed' | 'current' | 'pending' | 'rejected';

export interface TimelineStep {
  id: string;
  label: string;
  status: TimelineStatus;
  timestamp?: string;
  description?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  type?: 'application' | 'report';
}

export function Timeline({ steps, type = 'application' }: TimelineProps) {
  const getIcon = (status: TimelineStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'current':
        return <Clock className="w-5 h-5 text-primary animate-pulse" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getLineColor = (status: TimelineStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-accent';
      case 'current':
        return 'bg-primary';
      case 'rejected':
        return 'bg-destructive';
      case 'pending':
      default:
        return 'bg-muted';
    }
  };

  const getStatusBadge = (status: TimelineStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-accent text-accent-foreground">Complete</Badge>;
      case 'current':
        return <Badge variant="default" className="bg-primary">In Progress</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex gap-4">
          {/* Icon and Line */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step.status === 'completed' ? 'bg-accent/10' :
              step.status === 'current' ? 'bg-primary/10' :
              step.status === 'rejected' ? 'bg-destructive/10' :
              'bg-muted'
            }`}>
              {getIcon(step.status)}
            </div>
            
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className={`w-0.5 h-16 mt-2 transition-all duration-500 ${getLineColor(step.status)}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-8">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-base">{step.label}</h4>
                {step.timestamp && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.timestamp}
                  </p>
                )}
              </div>
              {getStatusBadge(step.status)}
            </div>
            
            {step.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {step.description}
              </p>
            )}

            {/* Additional info for current step */}
            {step.status === 'current' && (
              <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <AlertCircle className="w-4 h-4" />
                  <span>This step is currently in progress</span>
                </div>
              </div>
            )}

            {/* Additional info for rejected step */}
            {step.status === 'rejected' && step.description && (
              <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Reason: {step.description}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Compact horizontal timeline for cards
export function CompactTimeline({ steps }: TimelineProps) {
  const currentIndex = steps.findIndex(step => step.status === 'current');
  const completedCount = steps.filter(step => step.status === 'completed').length;
  const isRejected = steps.some(step => step.status === 'rejected');

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              step.status === 'completed' ? 'bg-accent' :
              step.status === 'current' ? 'bg-primary' :
              step.status === 'rejected' ? 'bg-destructive' :
              'bg-muted'
            }`} />
            {index < steps.length - 1 && (
              <div className="w-1 h-1 rounded-full bg-muted mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        {steps.map((step) => (
          <div key={step.id} className={`flex items-center gap-1 ${
            step.status === 'completed' ? 'text-accent' :
            step.status === 'current' ? 'text-primary font-medium' :
            step.status === 'rejected' ? 'text-destructive' :
            'text-muted-foreground'
          }`}>
            {step.status === 'completed' && <CheckCircle className="w-3 h-3" />}
            {step.status === 'current' && <Clock className="w-3 h-3 animate-pulse" />}
            {step.status === 'rejected' && <XCircle className="w-3 h-3" />}
            <span>{step.label}</span>
          </div>
        ))}
      </div>

      {/* Status summary */}
      <div className="text-sm text-muted-foreground">
        {isRejected ? (
          <span className="text-destructive">Application rejected at {steps.find(s => s.status === 'rejected')?.label}</span>
        ) : (
          <span>{completedCount} of {steps.length} steps completed</span>
        )}
      </div>
    </div>
  );
}