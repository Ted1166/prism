import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobApplicationDemo } from "@/components/demos/JobApplicationDemo";
import { WhistleblowerDemo } from "@/components/demos/WhistleblowerDemo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { initializeStorage } from "@/lib/storage"; // ← ADD THIS

const Demo = () => {
  // Initialize storage on mount
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <>
      <Navigation /> {/* ← ADD THIS */}
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12 pt-24"> {/* ← ADD pt-24 */}
        <div className="container mx-auto px-6">
          {/* Back button - REMOVE THIS, Navigation handles it now */}
          {/* <Link to="/">
            <Button variant="ghost" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link> */}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Interactive Demo
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience PRISM's privacy-preserving zero-knowledge proofs in action
            </p>
          </div>

          {/* Demo tabs */}
          <Tabs defaultValue="job" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="job" className="text-base">
                Job Application
              </TabsTrigger>
              <TabsTrigger value="whistleblower" className="text-base">
                Whistleblower Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="job" className="mt-0">
              <JobApplicationDemo />
            </TabsContent>

            <TabsContent value="whistleblower" className="mt-0">
              <WhistleblowerDemo />
            </TabsContent>
          </Tabs>

          {/* Technical note */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-card border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-primary">🔬 Technical Implementation</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong className="text-foreground">Proof Generation:</strong> Uses Noir circuits compiled to ACIR format, 
                  generating zero-knowledge proofs that validate claims without revealing underlying data.
                </p>
                <p>
                  <strong className="text-foreground">On-Chain Verification:</strong> Proofs are verified by Garaga-generated 
                  Cairo verifier contracts deployed on Starknet, ensuring trustless validation.
                </p>
                <p>
                  <strong className="text-foreground">Privacy Guarantees:</strong> Pedersen commitments hide credential data, 
                  nullifiers prevent double-use, and ZK-SNARKs prove qualifications without identity disclosure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Demo;