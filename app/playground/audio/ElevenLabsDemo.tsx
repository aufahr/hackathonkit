"use client";

import { TextToSpeech, ConversationalAI, SoundEffects } from "@/components/elevenlabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Phone, Info, Sparkles, Zap, CheckCircle2, ArrowRight, Waves } from "lucide-react";

export function ElevenLabsDemo() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
            <Volume2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Voice AI Playground</h1>
            <p className="text-muted-foreground text-sm">
              Powered by ElevenLabs
            </p>
          </div>
          <span className="ml-auto rounded-full bg-gradient-to-r from-primary/15 to-orange-500/15 px-4 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              Live Demo
            </span>
          </span>
        </div>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Generate natural-sounding speech from text or have real-time conversations with AI voice agents.
        </p>
      </div>

      {/* Demo Tabs */}
      <Tabs defaultValue="text-to-speech" className="space-y-8">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-secondary/80 p-1.5 text-muted-foreground backdrop-blur-sm">
          <TabsTrigger 
            value="text-to-speech" 
            className="inline-flex items-center justify-center gap-2.5 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-premium"
          >
            <Volume2 className="h-4 w-4" />
            Text to Speech
          </TabsTrigger>
          <TabsTrigger 
            value="sound-effects" 
            className="inline-flex items-center justify-center gap-2.5 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-premium"
          >
            <Waves className="h-4 w-4" />
            Sound Effects
          </TabsTrigger>
          <TabsTrigger 
            value="voice-agent" 
            className="inline-flex items-center justify-center gap-2.5 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-premium"
          >
            <Phone className="h-4 w-4" />
            Voice Agent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text-to-speech" className="space-y-6 mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TextToSpeech />
            </div>
            <div className="space-y-5">
              <InfoCard
                icon={<Info className="h-4 w-4" />}
                title="About Text to Speech"
              >
                <p className="mb-4">
                  Convert text into natural-sounding audio using state-of-the-art AI voices.
                </p>
                <FeatureList
                  title="Features"
                  items={[
                    "30+ premium voices",
                    "29 languages supported",
                    "Adjustable voice settings",
                    "High-quality audio output",
                  ]}
                  variant="primary"
                />
                <FeatureList
                  title="Use Cases"
                  items={[
                    "Audiobook creation",
                    "Video narration",
                    "Accessibility tools",
                    "Content creation",
                  ]}
                  variant="muted"
                />
              </InfoCard>
              <TipCard>
                Try different voices to find the perfect one for your use case. Each voice has unique characteristics!
              </TipCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sound-effects" className="space-y-6 mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SoundEffects />
            </div>
            <div className="space-y-5">
              <InfoCard
                icon={<Info className="h-4 w-4" />}
                title="About Sound Effects"
              >
                <p className="mb-4">
                  Generate custom sound effects from text descriptions using AI.
                </p>
                <FeatureList
                  title="Features"
                  items={[
                    "Text-to-sound generation",
                    "Adjustable duration",
                    "Prompt influence control",
                    "High-quality audio output",
                  ]}
                  variant="primary"
                />
                <FeatureList
                  title="Use Cases"
                  items={[
                    "Game development",
                    "Video production",
                    "Podcast enhancement",
                    "Creative projects",
                  ]}
                  variant="muted"
                />
              </InfoCard>
              <TipCard>
                Be descriptive with your prompts! Include details about the environment, intensity, and character of the sound you want.
              </TipCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="voice-agent" className="space-y-6 mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ConversationalAI />
            </div>
            <div className="space-y-5">
              <InfoCard
                icon={<Info className="h-4 w-4" />}
                title="About Voice Agents"
              >
                <p className="mb-4">
                  Build interactive voice agents that can have natural conversations in real-time.
                </p>
                <FeatureList
                  title="Features"
                  items={[
                    "Real-time voice interaction",
                    "Low-latency responses",
                    "Natural conversation flow",
                    "Customizable personality",
                  ]}
                  variant="primary"
                />
                <FeatureList
                  title="Use Cases"
                  items={[
                    "Customer support",
                    "Virtual assistants",
                    "Interactive storytelling",
                    "Language learning",
                  ]}
                  variant="muted"
                />
              </InfoCard>
              <GettingStartedCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({ 
  icon, 
  title, 
  children 
}: { 
  icon: React.ReactNode; 
  title: string; 
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-premium transition-all hover:shadow-premium-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}

function FeatureList({ 
  title, 
  items, 
  variant 
}: { 
  title: string; 
  items: string[]; 
  variant: "primary" | "muted";
}) {
  return (
    <div className="space-y-2.5 mb-4">
      <h4 className="font-medium text-foreground text-sm">{title}</h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm">
            <CheckCircle2 
              className={`h-4 w-4 flex-shrink-0 ${
                variant === "primary" ? "text-primary" : "text-muted-foreground/60"
              }`} 
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TipCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          Pro Tip
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}

function GettingStartedCard() {
  const steps = [
    { 
      text: "Go to ElevenLabs dashboard", 
      link: "https://elevenlabs.io/conversational-ai" 
    },
    { text: "Create a new agent" },
    { text: "Copy the Agent ID" },
    { text: "Paste it in the input field" },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-accent/80 to-accent/40 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Zap className="h-4 w-4" />
          </div>
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-4">
        <p>Create an agent in the ElevenLabs dashboard first:</p>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3 group">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-500 text-[11px] font-bold text-primary-foreground shadow-sm">
                {index + 1}
              </span>
              {step.link ? (
                <a 
                  href={step.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
                >
                  {step.text}
                  <ArrowRight className="h-3 w-3" />
                </a>
              ) : (
                <span>{step.text}</span>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
