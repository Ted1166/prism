import { Hero } from "@/components/Hero";
import { UseCases } from "@/components/UseCases";
import { HowItWorks } from "@/components/HowItWorks";
import { TechStack } from "@/components/TechStack";
import { CTA } from "@/components/CTA";
import { Statistics } from "@/components/Statistics";
import { ZKProofVisualizer } from "@/components/ZKProofVisualizer";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <>
      <Navigation/>
    <div className="min-h-screen pt-16">
      <Hero />
      <Statistics />
      <UseCases />
      <ZKProofVisualizer />
      <HowItWorks />
      <TechStack />
      <CTA />
    </div>
    </>
  );
};

export default Index;