# AGENTS.md - AI Agent Context for ElevenLabs Hackathon Kit

This document provides context for AI agents working on this codebase.

## Project Overview

**ElevenLabs Hackathon Kit** is a production-ready Next.js starter template for building AI-powered voice applications. It integrates ElevenLabs' voice AI capabilities with a modern full-stack architecture.

### Core Purpose
- Provide a polished starting point for hackathon projects
- Demonstrate best practices for ElevenLabs API integration
- Include real-time backend, authentication, and premium UI components

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | Frontend framework (App Router) | 16.x |
| Convex | Real-time backend & database | Latest |
| ElevenLabs | Voice AI (TTS, Conversational AI) | SDK v1.x |
| Tailwind CSS | Styling | 4.x |
| shadcn/ui | UI component library | Latest |
| TypeScript | Type safety | 5.7 |
| Bun | Package manager & runtime | Latest |

## Project Structure

```
hackathonkit/
├── app/
│   ├── (splash)/              # Landing page (public)
│   │   ├── GetStarted/        # Main landing page component
│   │   └── layout.tsx         # Splash page layout
│   ├── (app)/                 # App area (protected)
│   │   ├── app/               # Dynamic app routes
│   │   │   ├── page.tsx       # Redirects to default app
│   │   │   └── [slug]/        # Dynamic app pages
│   │   └── layout.tsx         # App layout (no sidebar)
│   ├── playground/            # Protected playground area
│   │   ├── audio/             # ElevenLabs audio demo
│   │   │   ├── page.tsx
│   │   │   └── ElevenLabsDemo.tsx
│   │   ├── chat/              # Chat playground
│   │   │   ├── page.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Message.tsx
│   │   │   └── MessageList.tsx
│   │   └── layout.tsx         # Sidebar layout for playground
│   ├── signin/                # Authentication page
│   ├── api/
│   │   └── elevenlabs/        # ElevenLabs API routes
│   │       ├── signed-url/    # WebSocket auth for Conversational AI
│   │       ├── text-to-speech/# TTS endpoint
│   │       └── voices/        # Voice listing endpoint
│   ├── globals.css            # Global styles & theme
│   └── layout.tsx             # Root layout
├── components/
│   ├── elevenlabs/            # ElevenLabs-specific components
│   │   ├── ConversationalAI.tsx
│   │   ├── TextToSpeech.tsx
│   │   └── index.ts           # Barrel export
│   ├── ui/                    # shadcn/ui components
│   ├── AppSidebar.tsx         # Main navigation sidebar
│   └── [other components]
├── config/                    # Configuration files
│   └── apps.ts                # App definitions & default app
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema
│   ├── auth.ts                # Authentication config
│   └── [functions]            # Backend functions
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
└── public/                    # Static assets
```

## Key Files & Their Purpose

### Entry Points
- `app/layout.tsx` - Root layout with providers
- `app/(splash)/page.tsx` - Landing page
- `app/playground/layout.tsx` - Playground layout with sidebar
- `middleware.ts` - Auth middleware for route protection

### ElevenLabs Integration
- `components/elevenlabs/TextToSpeech.tsx` - Text-to-speech component
- `components/elevenlabs/ConversationalAI.tsx` - Voice agent component
- `app/api/elevenlabs/*/route.ts` - API route handlers

### Styling
- `app/globals.css` - Theme variables and utility classes
- `tailwind.config.ts` - Tailwind configuration
- Uses orange/amber color scheme (primary: HSL 24 100% 50%)

### Authentication
- `convex/auth.ts` - Auth configuration (GitHub OAuth, Resend magic links)
- `middleware.ts` - Route protection (/playground/* requires auth)
- `app/signin/page.tsx` - Sign-in page

## Design System

### Theme Colors
- **Primary**: Orange (HSL 24 100% 50%)
- **Accent**: Amber tones
- **Background**: Warm off-white (light) / Dark charcoal (dark)

### Design Philosophy
- "Billion dollar startup" aesthetic
- Soft pop design with playful elements
- Clean and enterprise-friendly
- Premium shadows and glassmorphism effects

### CSS Utility Classes
```css
.glass          /* Glassmorphism effect */
.shadow-premium /* Multi-layer premium shadow */
.shadow-glow    /* Glowing shadow effect */
.text-gradient  /* Gradient text */
.hover-lift     /* Lift on hover animation */
.card-shine     /* Shine effect on cards */
```

## Common Tasks

### Adding a New Page
1. Create folder in `app/` following Next.js App Router conventions
2. Add `page.tsx` for the route
3. Use existing layout or create new layout.tsx
4. If protected, route is under `/playground/*`

### Adding UI Components
```bash
bunx shadcn@latest add [component-name]
```

### Working with ElevenLabs
1. **Text-to-Speech**: Use `TextToSpeech` component or call `/api/elevenlabs/text-to-speech`
2. **Conversational AI**: Use `ConversationalAI` component with an agent ID
3. **Voices**: Fetch from `/api/elevenlabs/voices`

### Running the Project
```bash
bun install          # Install dependencies
bun run dev          # Start dev server (Next.js + Convex)
bun run build        # Production build
```

## Configuration

### Apps Configuration (`config/apps.ts`)

Define and manage multiple apps for experimentation:

```typescript
// config/apps.ts
export const apps: AppConfig[] = [
  {
    slug: "demo",
    name: "Demo App",
    description: "Default starter template",
  },
  {
    slug: "voice-assistant",
    name: "Voice Assistant", 
    description: "AI voice assistant demo",
  },
];

// Set the default app - users redirect here from /app
export const defaultAppSlug = "demo";
```

**To add a new app:**
1. Add entry to `apps` array in `config/apps.ts`
2. Create page at `app/(app)/app/[slug]/page.tsx` (already handles dynamic routing)
3. Optionally change `defaultAppSlug` to make it the default

**Helper functions:**
- `getAppBySlug(slug)` - Get app config by slug
- `getDefaultApp()` - Get default app config

## Environment Variables

Required:
- `ELEVENLABS_API_KEY` - ElevenLabs API key

Convex (auto-generated):
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`

Optional (for auth):
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_RESEND_KEY`

## Code Conventions

### File Naming
- Components: PascalCase (`UserMenu.tsx`)
- Utilities: camelCase (`utils.ts`)
- Pages: `page.tsx` (Next.js convention)

### Imports
- Use `@/` alias for root imports
- Barrel exports for component folders

### Styling
- Tailwind CSS utility classes
- `cn()` helper for conditional classes
- CSS variables for theming

## Testing Changes

1. Run `bun run build` to check for TypeScript errors
2. Run `bun run dev` to test locally
3. Check both light and dark modes
4. Verify responsive design

## Important Notes

- Protected routes require authentication via Convex Auth
- The sidebar is implemented using shadcn/ui Sidebar component
- ElevenLabs API calls are proxied through Next.js API routes
- Real-time features use Convex subscriptions
