import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, Users, FileCheck, Lock, Eye, AlertCircle } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'accent' | 'destructive';
}

function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { 
  end: number; 
  duration?: number; 
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function StatCard({ icon, label, value, suffix = '', prefix = '', description, trend, trendValue, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary border-primary/20',
    accent: 'text-accent border-accent/20',
    destructive: 'text-destructive border-destructive/20',
  };

  const bgClasses = {
    primary: 'bg-primary/10',
    accent: 'bg-accent/10',
    destructive: 'bg-destructive/10',
  };

  return (
    <Card className={`${colorClasses[color]} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${bgClasses[color]}`}>
            {icon}
          </div>
          {trend && trendValue && (
            <Badge variant={trend === 'up' ? 'default' : 'secondary'} className="gap-1">
              <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trendValue}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">
            <AnimatedCounter end={value} suffix={suffix} prefix={prefix} />
          </p>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function Statistics() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2">
            <TrendingUp className="w-4 h-4" />
            Platform Impact
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Privacy in Numbers
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real impact from zero-knowledge proof employment verification
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Users className="w-6 h-6 text-primary" />}
            label="Anonymous Applications"
            value={1247}
            description="Submitted without revealing identity"
            trend="up"
            trendValue="+23%"
            color="primary"
          />
          
          <StatCard
            icon={<Shield className="w-6 h-6 text-accent" />}
            label="Whistleblower Reports"
            value={89}
            description="Protected reports verified on-chain"
            trend="up"
            trendValue="+12%"
            color="accent"
          />
          
          <StatCard
            icon={<FileCheck className="w-6 h-6 text-primary" />}
            label="Verified Credentials"
            value={3452}
            description="Issued by employers & universities"
            trend="up"
            trendValue="+45%"
            color="primary"
          />
          
          <StatCard
            icon={<Lock className="w-6 h-6 text-accent" />}
            label="Identities Exposed"
            value={0}
            description="Perfect privacy guarantee maintained"
            trend="neutral"
            color="accent"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Bias Reduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Traditional Hiring</span>
                    <span className="text-sm font-medium">High Bias</span>
                  </div>
                  <div className="h-2 bg-destructive/20 rounded-full">
                    <div className="h-2 bg-destructive rounded-full w-[75%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">PRISM Anonymous</span>
                    <span className="text-sm font-medium text-accent">
                      <AnimatedCounter end={95} suffix="%" /> Reduction
                    </span>
                  </div>
                  <div className="h-2 bg-accent/20 rounded-full">
                    <div className="h-2 bg-accent rounded-full w-[95%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Whistleblower Safety
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reports Filed</span>
                  <span className="text-2xl font-bold text-accent">
                    <AnimatedCounter end={89} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Identities Protected</span>
                  <span className="text-2xl font-bold text-accent">
                    <AnimatedCounter end={89} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-2xl font-bold text-accent">100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Network Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Proofs Verified</span>
                  <span className="text-2xl font-bold text-primary">
                    <AnimatedCounter end={1336} />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">On Starknet</span>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Live
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Proof Time</span>
                  <span className="text-sm font-medium">2.3s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Join the Privacy Revolution</h3>
                <p className="text-muted-foreground">
                  Be part of the future of bias-free employment and protected whistleblowing
                </p>
              </div>
              <div className="flex gap-3">
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <Lock className="w-4 h-4 mr-2" />
                  100% Anonymous
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Zero Trust Required
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}