import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, AlertTriangle, Building2, Check } from "lucide-react";

export const UseCases = () => {
  const cases = [
    {
      icon: Briefcase,
      title: "Anonymous Job Applications",
      description: "Prove you're qualified without revealing your identity. No bias, no discrimination, just merit.",
      features: [
        "Hide your name, school, and employers",
        "Prove experience and skills cryptographically",
        "One application per person (no spam)",
        "Reveal identity only when you choose"
      ],
      accentColor: "primary",
    },
    {
      icon: AlertTriangle,
      title: "Protected Whistleblowing",
      description: "Report corporate misconduct safely. Complete anonymity with cryptographic proof of employment.",
      features: [
        "Prove you witnessed incidents without revealing identity",
        "Cannot be identified or retaliated against",
        "Submit evidence securely",
        "Claim rewards anonymously"
      ],
      accentColor: "accent",
    },
    {
      icon: Building2,
      title: "For Employers",
      description: "Hire without bias. Receive qualified candidates and credible reports without compromising privacy.",
      features: [
        "Evaluate merit, not demographics",
        "Automatic requirement verification",
        "Legal compliance (GDPR, privacy laws)",
        "Transparent, fair hiring process"
      ],
      accentColor: "primary",
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Three Powerful <span className="text-primary">Use Cases</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            PRISM revolutionizes employment verification with privacy-preserving zero-knowledge proofs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {cases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card 
                key={index}
                className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated p-8 space-y-6 group"
              >
                <div className={`w-14 h-14 rounded-lg bg-${useCase.accentColor}/10 flex items-center justify-center group-hover:shadow-glow-cyan transition-all duration-300`}>
                  <Icon className={`w-7 h-7 text-${useCase.accentColor}`} />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">{useCase.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>

                <ul className="space-y-3">
                  {useCase.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full group-hover:border-primary/70 transition-all">
                  Learn More
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};