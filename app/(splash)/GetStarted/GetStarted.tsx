import { Code } from "@/components/Code";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Volume2,
  MessageSquare,
  Wand2,
  Zap,
  Globe,
  ArrowRight,
  Github,
  BookOpen,
  Sparkles,
  Play,
  Box,
  Layers,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export const GetStarted = () => {
  return (
    <div className="flex grow flex-col">
      {/* Hero Section - mymind inspired: clean, lots of whitespace */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6">
        {/* Soft floating shapes - playful but minimal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute bottom-20 right-[15%] w-96 h-96 rounded-full bg-orange-100/50 blur-3xl" />
          <div className="absolute top-1/3 right-[10%] w-48 h-48 rounded-full bg-rose-100/40 blur-2xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Minimal badge */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Ready to ship
            </span>
          </div>

          {/* Big bold headline - mymind style */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.95]">
            <span className="block">Build faster.</span>
            <span className="block text-muted-foreground/60">Ship sooner.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            A complete starter kit for your next hackathon. 
            Voice AI, real-time chat, authentication — all pre-configured.
          </p>

          {/* Clean CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button asChild size="lg" className="h-14 px-8 text-base font-medium rounded-full">
              <Link href="/playground/audio">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-14 px-8 text-base font-medium rounded-full">
              <Link href="https://github.com" target="_blank">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Link>
            </Button>
          </div>

          {/* Simple tech stack pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Next.js", "Convex", "ElevenLabs", "Tailwind", "shadcn/ui"].map((tech) => (
              <span 
                key={tech}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-secondary/60 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Clean grid with playful icons */}
      <section className="py-24 md:py-32 px-6 border-t">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything included
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Stop wrestling with boilerplate. Start building features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Volume2 />}
              title="Text to Speech"
              description="Convert text to natural speech with 30+ voices in 29 languages."
              color="bg-amber-100 text-amber-600"
            />
            <FeatureCard
              icon={<Mic />}
              title="Voice Agents"
              description="Build conversational AI agents with real-time voice interaction."
              color="bg-rose-100 text-rose-600"
            />
            <FeatureCard
              icon={<MessageSquare />}
              title="Real-time Chat"
              description="Live messaging powered by Convex. Instant sync across all clients."
              color="bg-blue-100 text-blue-600"
            />
            <FeatureCard
              icon={<Zap />}
              title="Authentication"
              description="GitHub OAuth and magic links. Secure and ready to use."
              color="bg-purple-100 text-purple-600"
            />
            <FeatureCard
              icon={<Layers />}
              title="Beautiful UI"
              description="Polished components from shadcn/ui. Dark mode included."
              color="bg-green-100 text-green-600"
            />
            <FeatureCard
              icon={<Globe />}
              title="Deploy Anywhere"
              description="Optimized for Vercel. One-click deployment ready."
              color="bg-orange-100 text-orange-600"
            />
          </div>
        </div>
      </section>

      {/* Quick Start - Minimal steps */}
      <section className="py-24 md:py-32 px-6 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Up and running in minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              Four steps. That's it.
            </p>
          </div>

          <div className="space-y-6">
            <StepCard number={1} title="Clone the repo">
              <code className="text-sm bg-background px-4 py-3 rounded-xl block font-mono">
                git clone &lt;repo-url&gt; && cd hackathonkit
              </code>
            </StepCard>
            
            <StepCard number={2} title="Add your API key">
              <code className="text-sm bg-background px-4 py-3 rounded-xl block font-mono">
                ELEVENLABS_API_KEY=your_key
              </code>
            </StepCard>
            
            <StepCard number={3} title="Install and run">
              <code className="text-sm bg-background px-4 py-3 rounded-xl block font-mono">
                bun install && bun run dev
              </code>
            </StepCard>
            
            <StepCard number={4} title="Start building">
              <p className="text-muted-foreground">
                Open <Code>localhost:3000</Code> and start hacking. All components are ready to customize.
              </p>
            </StepCard>
          </div>
        </div>
      </section>

      {/* Resources - Simple links */}
      <section className="py-24 md:py-32 px-6 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Resources
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <ResourceLink 
              href="https://elevenlabs.io/docs" 
              title="ElevenLabs Docs"
              description="API reference and guides"
            />
            <ResourceLink 
              href="https://docs.convex.dev" 
              title="Convex Docs"
              description="Real-time backend documentation"
            />
            <ResourceLink 
              href="https://ui.shadcn.com" 
              title="shadcn/ui"
              description="Component library"
            />
            <ResourceLink 
              href="https://nextjs.org/docs" 
              title="Next.js Docs"
              description="Framework documentation"
            />
          </div>
        </div>
      </section>

      {/* Footer - Ultra minimal */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <Box className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold">Hackathon Kit</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for builders. Ship something amazing.
          </p>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <div className="w-5 h-5">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-6 items-start p-6 rounded-2xl bg-card border border-border/50">
      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ResourceLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      className="group flex items-center justify-between p-5 rounded-xl border border-border/50 hover:border-border hover:bg-secondary/30 transition-all"
    >
      <div>
        <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
