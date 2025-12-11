# CLAUDE.md - Instructions for Claude AI

This file provides guidance for Claude when working on the ElevenLabs Hackathon Kit codebase.

## Project Summary

This is an **ElevenLabs Hackathon Kit** - a Next.js 16 starter template with:
- ElevenLabs voice AI integration (Text-to-Speech, Conversational AI)
- Convex real-time backend
- shadcn/ui components with orange/amber theme
- Authentication (GitHub OAuth, magic links)

## Quick Reference

### Key Directories
```
app/(app)/            → Protected app area (multiple apps)
app/playground/       → Protected demo pages (audio, chat)
app/(splash)/         → Public landing page
app/api/elevenlabs/   → ElevenLabs API routes
components/elevenlabs/→ Voice AI components
components/ui/        → shadcn/ui components
config/               → App configuration files
convex/               → Backend functions & schema
```

### Important Commands
```bash
bun install           # Install dependencies
bun run dev           # Start development (Next.js + Convex)
bun run build         # Build for production (check for errors)
bunx shadcn@latest add [name]  # Add shadcn component
```

### Environment Variables
Required: `ELEVENLABS_API_KEY`

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use proper typing, avoid `any`
- Prefer interfaces over types for objects

### React/Next.js
- Use App Router conventions (page.tsx, layout.tsx)
- Server Components by default, add "use client" when needed
- Use `@/` path alias for imports

### Styling
- Tailwind CSS utility classes
- Use `cn()` from `@/lib/utils` for conditional classes
- Follow the orange/amber color scheme (primary: HSL 24 100% 50%)
- Premium utility classes available: `.glass`, `.shadow-premium`, `.hover-lift`

### Component Patterns
```tsx
// Client component with proper typing
"use client"

import { cn } from "@/lib/utils"

interface MyComponentProps {
  className?: string
  children: React.ReactNode
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  )
}
```

## When Making Changes

### Before Editing
1. Understand the file's purpose and context
2. Check related files that might be affected
3. Note the existing code style

### After Editing
1. Run `bun run build` to verify no TypeScript errors
2. Ensure imports are correct
3. Maintain consistent styling

### Do NOT
- Remove authentication from protected routes
- Change the Convex schema without updating related functions
- Use inline styles (use Tailwind classes)
- Add dependencies without justification

## Common Patterns

### Adding a New Playground Page
```tsx
// app/playground/[name]/page.tsx
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

export default async function NewPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Page Name</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main className="flex-1 overflow-auto p-6">
        {/* Content */}
      </main>
    </>
  )
}
```

### Using ElevenLabs Components
```tsx
import { TextToSpeech, ConversationalAI } from "@/components/elevenlabs"

// Text to Speech
<TextToSpeech />

// Conversational AI (voice agent)
<ConversationalAI agentId="your-agent-id" />
```

### API Route Pattern
```tsx
// app/api/example/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ data: "example" })
}

export async function POST(request: Request) {
  const body = await request.json()
  // Process...
  return NextResponse.json({ success: true })
}
```

## UI Components Available

### shadcn/ui (in components/ui/)
- Button, Card, Input, Textarea
- Select, Slider, Tabs
- Dialog, Sheet, Popover
- Sidebar (with full navigation support)
- Breadcrumb, Separator
- Avatar, Badge, Skeleton
- And more...

### ElevenLabs Components
- `TextToSpeech` - Full TTS interface with voice selection
- `ConversationalAI` - Voice agent with real-time conversation
- `ElevenLabsIcon` - Logo component

### Custom Hooks
- `use-mobile` - Detect mobile viewport
- `use-transcript-viewer` - Audio transcript with highlighting

## Troubleshooting

### Build Errors
- Check for missing imports
- Verify all components are properly exported
- Ensure "use client" is added for client-side hooks

### Auth Issues
- Middleware protects `/playground/*` routes
- Sign-in redirects to `/playground/audio`
- Check Convex auth configuration

### ElevenLabs API
- API key must be set in `.env.local`
- Requests are proxied through `/api/elevenlabs/*`
- Check rate limits if requests fail

## Configuration

### Apps Configuration (`config/apps.ts`)

Configure multiple apps and set the default:

```typescript
// Add a new app
export const apps: AppConfig[] = [
  { slug: "demo", name: "Demo App", description: "..." },
  { slug: "my-app", name: "My App", description: "..." },
];

// Change default app (redirects from /app)
export const defaultAppSlug = "demo";
```

**Helper functions:**
- `getAppBySlug(slug)` - Get app by slug
- `getDefaultApp()` - Get default app

## File Locations for Common Tasks

| Task | File(s) |
|------|---------|
| Change theme colors | `app/globals.css` |
| Add sidebar item | `components/AppSidebar.tsx` |
| Modify landing page | `app/(splash)/GetStarted/GetStarted.tsx` |
| Add API route | `app/api/[name]/route.ts` |
| Add UI component | `bunx shadcn@latest add [name]` |
| Modify auth | `convex/auth.ts`, `middleware.ts` |
| Configure apps | `config/apps.ts` |
| Change default app | `config/apps.ts` → `defaultAppSlug` |
