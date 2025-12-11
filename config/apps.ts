import { Layers, Mic, Box, Sparkles, Zap, Globe, MessageSquare, Volume2, Skull } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface LandingConfig {
  headline: string;
  subheadline: string;
  tagline: string;
  features: {
    icon: LucideIcon;
    title: string;
    description: string;
    color: string;
  }[];
  techStack: string[];
}

export interface AppConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  landing?: LandingConfig;
}

// Define your apps here - add new apps as you build them
export const apps: AppConfig[] = [
  {
    slug: "dungeon",
    name: "Murder Mystery",
    description: "Multiplayer voice-powered detective game",
    icon: Skull,
    landing: {
      headline: "Solve the crime.",
      subheadline: "Together.",
      tagline: "A multiplayer murder mystery where an AI detective narrates the investigation. Join on your phone, interrogate suspects, and crack the case.",
      features: [
        { icon: Skull, title: "Murder Mystery", description: "Investigate a thrilling crime with twists and turns.", color: "bg-red-100 text-red-600" },
        { icon: Mic, title: "AI Detective", description: "Voice-powered narrator guides your investigation.", color: "bg-amber-100 text-amber-600" },
        { icon: MessageSquare, title: "Multiplayer", description: "Friends join via QR code on their phones.", color: "bg-blue-100 text-blue-600" },
        { icon: Zap, title: "Real-time", description: "Everyone sees clues and actions instantly.", color: "bg-purple-100 text-purple-600" },
        { icon: Volume2, title: "Immersive Audio", description: "Atmospheric sounds bring the mystery to life.", color: "bg-green-100 text-green-600" },
        { icon: Sparkles, title: "Dynamic Story", description: "AI adapts to your investigation choices.", color: "bg-orange-100 text-orange-600" },
      ],
      techStack: ["ElevenLabs", "Convex", "Next.js", "Real-time", "AI"],
    },
  },
];

// Set the default app slug - users will be redirected here from /app
export const defaultAppSlug = "dungeon";

// Helper to get app by slug
export function getAppBySlug(slug: string): AppConfig | undefined {
  return apps.find((app) => app.slug === slug);
}

// Helper to get default app
export function getDefaultApp(): AppConfig {
  return apps.find((app) => app.slug === defaultAppSlug) || apps[0];
}
