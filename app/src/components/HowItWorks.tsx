import { Card } from "@/components/ui/card";
import { ArrowRight, FileCheck, Lock, Sparkles, Shield } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: FileCheck,
      title: "Get Verified Credentials",
      description: "Your employer or university issues you a digital credential stored on Starknet with cryptographic commitment.",
      details: "Nobody can see what's inside the credential, just that it exists and is valid."
    },
    {
      number: "02",
      icon: Lock,
      title: "Generate Zero-Knowledge Proof",
      description: "Create a cryptographic proof that you meet job requirements without revealing any identifying information.",
      details: "Proves qualifications ✓ Hides name, school, and employers ✗"
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Submit Anonymously",
      description: "Your proof includes a unique nullifier preventing duplicate applications while maintaining complete privacy.",
      details: "One application per person, but no one can link applications together."
    },
    {
      number: "04",
      icon: Shield,
      title: "Progressive Disclosure",
      description: "You control what you reveal and when. Start anonymous, reveal identity only when you choose to.",
      details: "Company interested? Reveal partial info. Job offer? Reveal full identity."
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-transparent via-primary/5 to-transparent relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            How <span className="text-primary">PRISM</span> Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Four simple steps to privacy-preserving employment verification
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={index} className="relative">
                <Card className="bg-card/30 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Number and Icon */}
                    <div className="flex flex-col items-center gap-4 md:w-32 shrink-0">
                      <div className="text-6xl font-bold text-primary/20 font-display">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-foreground/80 leading-relaxed text-lg">
                        {step.description}
                      </p>
                      <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-4 border border-border">
                        💡 {step.details}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Connector arrow */}
                {!isLast && (
                  <div className="flex justify-center py-4">
                    <ArrowRight className="w-6 h-6 text-primary/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom highlight */}
        <div className="mt-20 text-center max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 p-8">
            <h3 className="text-2xl font-bold mb-4">The Magic of Zero-Knowledge</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="text-accent text-xl">✅</div>
                <div>
                  <div className="font-semibold">Traditional Approach:</div>
                  <div className="text-sm text-muted-foreground">Share entire resume → Wait for verification → Privacy gone</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-primary text-xl">⚡</div>
                <div>
                  <div className="font-semibold">PRISM Approach:</div>
                  <div className="text-sm text-muted-foreground">Generate proof → Instant verification → Privacy intact</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};