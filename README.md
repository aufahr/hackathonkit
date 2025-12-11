# 🚀 Hackathon Kit

Your complete starter kit for building amazing AI-powered applications. Voice AI, real-time chat, authentication — all pre-configured and ready to ship.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Voice_AI-violet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

## ✨ Features

- **🔊 Text to Speech** - Convert text into natural-sounding speech with 30+ premium voices
- **🤖 Conversational AI** - Build interactive voice agents for real-time conversations
- **🌍 Multilingual** - Support for 29+ languages out of the box
- **🎨 Beautiful UI** - Polished components built with shadcn/ui and Tailwind CSS
- **⚡ Real-time Backend** - Powered by Convex for instant data sync
- **🔐 Authentication** - Built-in auth with GitHub OAuth and magic links

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hackathonkit
bun install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# ElevenLabs API Key (Required)
# Get yours at: https://elevenlabs.io/api
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Convex (auto-generated on first run)
CONVEX_DEPLOYMENT=your_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Auth (optional - for GitHub OAuth)
AUTH_GITHUB_ID=your_github_oauth_id
AUTH_GITHUB_SECRET=your_github_oauth_secret

# Auth (optional - for magic links)
AUTH_RESEND_KEY=your_resend_api_key
```

### 3. Run the Development Server

```bash
bun run dev
```

This will start:
- Next.js frontend on [http://localhost:3000](http://localhost:3000)
- Convex backend (auto-syncs with cloud)

## 📁 Project Structure

```
├── app/
│   ├── (splash)/           # Landing page (public)
│   ├── playground/         # Protected demo pages
│   │   ├── audio/          # ElevenLabs audio playground
│   │   └── chat/           # Chat playground
│   ├── signin/             # Sign-in page
│   └── api/
│       └── elevenlabs/     # ElevenLabs API routes
│           ├── signed-url/ # For conversational AI
│           ├── text-to-speech/
│           └── voices/
├── components/
│   ├── elevenlabs/         # ElevenLabs components
│   │   ├── ConversationalAI.tsx
│   │   ├── TextToSpeech.tsx
│   │   └── ElevenLabsLogo.tsx
│   └── ui/                 # shadcn/ui components
├── convex/                 # Convex backend
├── hooks/                  # Custom React hooks
└── lib/                    # Utility functions
```

## 🎯 Using the Components

### Text to Speech

```tsx
import { TextToSpeech } from "@/components/elevenlabs";

export default function MyPage() {
  return <TextToSpeech />;
}
```

### Conversational AI (Voice Agent)

```tsx
import { ConversationalAI } from "@/components/elevenlabs";

export default function MyPage() {
  // Optional: Pass a default agent ID
  return <ConversationalAI agentId="your-agent-id" />;
}
```

### Using the ElevenLabs Provider (Optional)

```tsx
import { ElevenLabsProvider, useElevenLabs } from "@/components/ElevenLabsProvider";

// Wrap your app
<ElevenLabsProvider>
  <YourApp />
</ElevenLabsProvider>

// Use in components
function MyComponent() {
  const { generateSpeech, voices, fetchVoices } = useElevenLabs();
  
  const handleSpeak = async () => {
    const audioUrl = await generateSpeech("Hello world!");
    // Play the audio
  };
}
```

## 🔧 API Routes

### Text to Speech
```
POST /api/elevenlabs/text-to-speech
Body: { text: string, voiceId?: string, modelId?: string }
Returns: audio/mpeg
```

### Get Voices
```
GET /api/elevenlabs/voices
Returns: { voices: Voice[] }
```

### Get Signed URL (for Conversational AI)
```
GET /api/elevenlabs/signed-url?agentId=<agent-id>
Returns: { signed_url: string }
```

## 🎨 Customization

### Changing the Theme

Edit `app/globals.css` to customize colors. The project uses a violet/purple theme by default:

```css
:root {
  --primary: 262 83% 58%; /* Violet */
}
```

### Adding New Voices

The Text to Speech component automatically fetches available voices from your ElevenLabs account. You can also use voices from the [Voice Library](https://elevenlabs.io/voice-library).

### Creating a Voice Agent

1. Go to [elevenlabs.io/conversational-ai](https://elevenlabs.io/conversational-ai)
2. Create a new agent
3. Customize the agent's personality and voice
4. Copy the Agent ID
5. Use it in the `ConversationalAI` component

## 📚 ElevenLabs Resources

- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [API Reference](https://elevenlabs.io/docs/api-reference)
- [React SDK](https://www.npmjs.com/package/@elevenlabs/react)
- [Voice Library](https://elevenlabs.io/voice-library)
- [Conversational AI Guide](https://elevenlabs.io/docs/conversational-ai)

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) with App Router
- **Backend**: [Convex](https://convex.dev/) - Real-time database & serverless functions
- **Auth**: [Convex Auth](https://labs.convex.dev/auth) - GitHub OAuth & Magic Links
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Voice AI**: [ElevenLabs](https://elevenlabs.io/) - Text to Speech & Conversational AI
- **Package Manager**: [Bun](https://bun.sh/)

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `ELEVENLABS_API_KEY`
   - Convex variables (auto-configured if using Convex CLI)
4. Deploy!

### Deploy Convex Backend

```bash
bunx convex deploy
```

## 📝 Commands

```bash
# Development
bun run dev          # Start dev server (Next.js + Convex)
bun run dev:frontend # Start only Next.js
bun run dev:backend  # Start only Convex

# Build & Production
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Lint code with Biome
bun run format       # Format code with Biome
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this for your hackathon project!

---

Built with ❤️ for the ElevenLabs Hackathon

**Happy hacking! 🎉**
