import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse delay-1000" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/30 shadow-glow-cyan">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Zero-Knowledge Employment Platform</span>
          </div>

          {/* Main heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Prove. Don't Reveal.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Apply to jobs and report misconduct <span className="text-primary font-semibold">anonymously</span>. 
            Powered by zero-knowledge proofs on Starknet.
          </p>

          {/* Value props */}
          <div className="flex flex-wrap justify-center gap-8 text-sm pt-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span>Privacy-First</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              <span>Cryptographically Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" />
              <span>You Control Identity</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button variant="default" size="lg" className="text-lg">
              Start Anonymous Application
            </Button>
            <Button variant="outline" size="lg" className="text-lg">
              Learn How It Works
            </Button>
          </div>

          {/* Demo stats */}
          <div className="pt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Anonymous</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">Zero</div>
              <div className="text-sm text-muted-foreground">Trust Required</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Privacy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};