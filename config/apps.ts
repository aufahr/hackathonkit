import { Layers, Mic, Box, Sparkles, Zap, Globe, MessageSquare, Volume2 } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface AppConfig {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

// Define your apps here - add new apps as you build them
export const apps: AppConfig[] = [
  {
    slug: "demo",
    name: "Demo App 1",
    description: "Default starter template",
    icon: Layers,
  },
  {
    slug: "voice-assistant",
    name: "Voice Assistant",
    description: "AI voice assistant demo",
    icon: Mic,
  },
];

// Set the default app slug - users will be redirected here from /app
export const defaultAppSlug = "demo";

// Helper to get app by slug
export function getAppBySlug(slug: string): AppConfig | undefined {
  return apps.find((app) => app.slug === slug);
}

// Helper to get default app
export function getDefaultApp(): AppConfig {
  return apps.find((app) => app.slug === defaultAppSlug) || apps[0];
}
