import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Book } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Glowing background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Heading */}
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold">
              Ready to Take Control of Your <span className="text-primary">Privacy?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the future of employment verification. Apply anonymously, report safely, hire fairly.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button variant="default" size="lg" className="text-lg group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg">
              <Book className="w-5 h-5" />
              Read Documentation
            </Button>
            <Button variant="ghost" size="lg" className="text-lg hover:text-primary">
              <Github className="w-5 h-5" />
              View on GitHub
            </Button>
          </div>

          {/* Features grid */}
          <div className="pt-16 grid md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-2">
              <div className="text-primary font-semibold text-lg">100% Anonymous</div>
              <div className="text-muted-foreground">Zero personal data exposure</div>
            </div>
            <div className="space-y-2">
              <div className="text-accent font-semibold text-lg">Cryptographically Secure</div>
              <div className="text-muted-foreground">Military-grade encryption</div>
            </div>
            <div className="space-y-2">
              <div className="text-primary font-semibold text-lg">No Trust Required</div>
              <div className="text-muted-foreground">Verified by mathematics</div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-16 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Built with Noir • Starknet • Zero-Knowledge Proofs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};