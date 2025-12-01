import { Hero } from "@/components/Hero";
import { UseCases } from "@/components/UseCases";
import { HowItWorks } from "@/components/HowItWorks";
import { TechStack } from "@/components/TechStack";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <UseCases />
      <HowItWorks />
      <TechStack />
      <CTA />
    </div>
  );
};

export default Index;