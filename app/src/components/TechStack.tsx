import { Card } from "@/components/ui/card";
import { Code2, Shield, Lock, Database, Zap } from "lucide-react";

export const TechStack = () => {
  const technologies = [
    {
      icon: Code2,
      name: "Noir Circuits",
      description: "Define what needs to be proven: credentials, requirements, employment verification",
      color: "primary"
    },
    {
      icon: Shield,
      name: "Zero-Knowledge Proofs",
      description: "Generate cryptographic proofs that validate claims without revealing data",
      color: "accent"
    },
    {
      icon: Lock,
      name: "Starknet Smart Contracts",
      description: "Verify proofs on-chain and manage the application/reporting process",
      color: "primary"
    },
    {
      icon: Database,
      name: "Commitments",
      description: "Hide credential data using cryptographic hashes for maximum privacy",
      color: "accent"
    },
    {
      icon: Zap,
      name: "Nullifiers",
      description: "Prevent double-applications while maintaining complete anonymity",
      color: "primary"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Built on <span className="text-primary">Cutting-Edge Tech</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            PRISM leverages the latest in cryptographic primitives and blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <Card 
                key={index}
                className="bg-card/30 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated p-6 space-y-4 group text-center"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto group-hover:shadow-glow-cyan transition-all duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Key advantages */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="text-4xl font-bold text-primary font-display">Privacy-First</div>
            <p className="text-muted-foreground">You control what you reveal and when</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl font-bold text-accent font-display">Trustless</div>
            <p className="text-muted-foreground">Cryptography guarantees honesty</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl font-bold text-primary font-display">Practical</div>
            <p className="text-muted-foreground">Works with existing credentials</p>
          </div>
        </div>
      </div>
    </section>
  );
};