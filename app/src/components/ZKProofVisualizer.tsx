import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Unlock, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Hash,
  FileCheck,
  Server
} from 'lucide-react';

type Step = 'intro' | 'data' | 'commitment' | 'proof' | 'verification' | 'result';

interface CredentialData {
  name: string;
  employer: string;
  yearsExperience: number;
  skills: string[];
}

export function ZKProofVisualizer() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPrivateData, setShowPrivateData] = useState(true);

  // Sample credential data
  const privateData: CredentialData = {
    name: "Alice Johnson",
    employer: "Google",
    yearsExperience: 7,
    skills: ["React", "TypeScript", "Node.js"]
  };

  // Sample commitment (hash)
  const commitment = "0x7b9d4c...8e3f2a";
  const proof = "0x3a8c1f...9d4e7b";

  const steps: Record<Step, { title: string; description: string; icon: any }> = {
    intro: {
      title: "Understanding Zero-Knowledge Proofs",
      description: "Watch how PRISM proves you're qualified without revealing your identity",
      icon: Sparkles
    },
    data: {
      title: "Your Private Data",
      description: "This is your sensitive information that stays hidden",
      icon: Lock
    },
    commitment: {
      title: "Creating Commitment",
      description: "Your data is hashed into a cryptographic commitment",
      icon: Hash
    },
    proof: {
      title: "Generating Proof",
      description: "A zero-knowledge proof is created using Noir circuits",
      icon: Shield
    },
    verification: {
      title: "On-Chain Verification",
      description: "Starknet smart contract verifies the proof",
      icon: Server
    },
    result: {
      title: "What Employer Sees",
      description: "Only the facts that matter, nothing else",
      icon: Eye
    }
  };

  const stepOrder: Step[] = ['intro', 'data', 'commitment', 'proof', 'verification', 'result'];

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepOrder[currentIndex + 1]);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepOrder[currentIndex - 1]);
        setIsAnimating(false);
      }, 300);
    }
  };

  const reset = () => {
    setCurrentStep('intro');
    setShowPrivateData(true);
  };

  const currentStepInfo = steps[currentStep];
  const CurrentIcon = currentStepInfo.icon;
  const currentIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentIndex + 1) / stepOrder.length) * 100;

  return (
    <section className="py-20 bg-gradient-to-b from-background/50 to-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-2">
            <Sparkles className="w-4 h-4" />
            Interactive Explainer
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              The Magic of Zero-Knowledge
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how cryptography proves you're qualified without revealing who you are
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentIndex + 1} of {stepOrder.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Visualizer Card */}
        <Card className="max-w-4xl mx-auto border-primary/20 shadow-glow-cyan">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
              <CurrentIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{currentStepInfo.title}</CardTitle>
            <CardDescription className="text-base">{currentStepInfo.description}</CardDescription>
          </CardHeader>

          <CardContent className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            {/* Step Content */}
            <div className="min-h-[400px] flex items-center justify-center">
              
              {/* INTRO */}
              {currentStep === 'intro' && (
                <div className="text-center space-y-6 max-w-2xl">
                  <div className="text-6xl mb-4">🔐</div>
                  <h3 className="text-2xl font-bold">How Does It Work?</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Zero-knowledge proofs let you prove you meet job requirements without revealing your name, 
                    previous employers, or exact qualifications. It's like showing a bouncer you're 21+ without 
                    showing your ID.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Card className="bg-accent/10 border-accent/20">
                      <CardContent className="pt-6 text-center">
                        <CheckCircle className="w-8 h-8 text-accent mx-auto mb-2" />
                        <p className="font-medium">You Prove</p>
                        <p className="text-sm text-muted-foreground">Qualifications</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="pt-6 text-center">
                        <EyeOff className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-medium">You Hide</p>
                        <p className="text-sm text-muted-foreground">Identity</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* DATA */}
              {currentStep === 'data' && (
                <div className="w-full max-w-md space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Your Sensitive Data</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPrivateData(!showPrivateData)}
                    >
                      {showPrivateData ? (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Visible to You Only
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hidden
                        </>
                      )}
                    </Button>
                  </div>

                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className={`font-medium ${showPrivateData ? '' : 'blur-sm select-none'}`}>
                          {privateData.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">Employer:</span>
                        <span className={`font-medium ${showPrivateData ? '' : 'blur-sm select-none'}`}>
                          {privateData.employer}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">Experience:</span>
                        <span className={`font-medium ${showPrivateData ? '' : 'blur-sm select-none'}`}>
                          {privateData.yearsExperience} years
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <span className="text-sm text-muted-foreground">Skills:</span>
                        <span className={`font-medium ${showPrivateData ? '' : 'blur-sm select-none'}`}>
                          {privateData.skills.join(', ')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>This information never leaves your device unencrypted</span>
                  </div>
                </div>
              )}

              {/* COMMITMENT */}
              {currentStep === 'commitment' && (
                <div className="w-full max-w-md space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
                      <Hash className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Cryptographic Hashing</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is transformed into a commitment using Pedersen hashing
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card className="border-muted">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Input</p>
                          <div className="p-3 bg-destructive/10 rounded-lg text-sm">
                            <div className="blur-sm select-none">
                              {JSON.stringify(privateData, null, 2)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-center">
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-6 h-6 text-primary rotate-90 animate-bounce" />
                        <span className="text-xs text-primary font-medium mt-2">Hash Function</span>
                      </div>
                    </div>

                    <Card className="border-primary/30 bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <p className="text-xs text-primary uppercase tracking-wide">Commitment (Hash)</p>
                          <div className="p-4 bg-background rounded-lg">
                            <code className="text-lg font-mono text-primary font-bold">
                              {commitment}
                            </code>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            ✓ Cannot be reversed to reveal original data
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* PROOF */}
              {currentStep === 'proof' && (
                <div className="w-full max-w-md space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                      <Shield className="w-8 h-8 text-accent animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Noir Circuit Execution</h3>
                    <p className="text-sm text-muted-foreground">
                      The ZK circuit proves you meet requirements without revealing data
                    </p>
                  </div>

                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Circuit Input:</span>
                          <Badge variant="outline">Private</Badge>
                        </div>
                        <div className="p-3 bg-background rounded-lg text-sm font-mono">
                          commitment: {commitment}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Requirements:</span>
                          <Badge variant="outline">Public</Badge>
                        </div>
                        <div className="p-3 bg-background rounded-lg text-sm space-y-1">
                          <div>✓ Experience ≥ 5 years</div>
                          <div>✓ Skills include React, TypeScript</div>
                          <div>✓ Bachelor's degree or higher</div>
                        </div>
                      </div>

                      <div className="flex justify-center py-2">
                        <ArrowRight className="w-6 h-6 text-accent rotate-90 animate-bounce" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-accent font-medium">Zero-Knowledge Proof:</span>
                          <CheckCircle className="w-5 h-5 text-accent" />
                        </div>
                        <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                          <code className="text-sm font-mono text-accent break-all">
                            {proof}
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-sm text-accent bg-accent/10 p-3 rounded-lg">
                    <Shield className="w-4 h-4" />
                    <span>Proof verifies requirements without revealing your data</span>
                  </div>
                </div>
              )}

              {/* VERIFICATION */}
              {currentStep === 'verification' && (
                <div className="w-full max-w-md space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <Server className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Starknet Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Smart contract verifies the proof on-chain
                    </p>
                  </div>

                  <Card className="border-primary/30">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <span className="text-sm">Proof Submitted</span>
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <span className="text-sm">Garaga Verifier Called</span>
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                        <span className="text-sm">Cryptographic Check</span>
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg">
                        <span className="text-sm font-medium">Verification Result</span>
                        <Badge variant="default" className="bg-accent text-accent-foreground">
                          ✓ VALID
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground mb-1">Network</p>
                      <p className="font-medium">Starknet Sepolia</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-muted-foreground mb-1">Gas Used</p>
                      <p className="font-medium">~0.003 ETH</p>
                    </div>
                  </div>
                </div>
              )}

              {/* RESULT */}
              {currentStep === 'result' && (
                <div className="w-full max-w-md space-y-6">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">✓</div>
                    <h3 className="text-2xl font-bold mb-2">Verification Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      Here's what the employer sees vs what stays hidden
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card className="border-accent/30 bg-accent/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="w-4 h-4 text-accent" />
                          What Employer Sees
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>Candidate meets all requirements ✓</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>Experience: Meets minimum (≥ 5 years) ✓</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>Skills: React, TypeScript verified ✓</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>Education: Sufficient ✓</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent" />
                          <span>Proof valid on Starknet ✓</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/30 bg-destructive/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-destructive" />
                          What Stays Hidden
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span className="line-through">Name: {privateData.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span className="line-through">Employer: {privateData.employer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span className="line-through">Exact experience: {privateData.yearsExperience} years</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span className="line-through">Full skill list</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-4 rounded-lg">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">
                      Perfect privacy: Qualified ✓ | Identity 🔒
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 'intro'}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {stepOrder.map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(step)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index <= currentIndex
                        ? 'bg-primary w-8'
                        : 'bg-muted'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              {currentStep === 'result' ? (
                <Button
                  variant="hero"
                  onClick={reset}
                >
                  Start Over
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={nextStep}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Info */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This is a simplified visualization. Actual cryptographic operations use Noir circuits, 
            Pedersen commitments, and Garaga verifiers on Starknet.
          </p>
        </div>
      </div>
    </section>
  );
}