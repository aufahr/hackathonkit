import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { api } from "@/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { Box, Sparkles } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexClientProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        {/* Main Content - Full width, no sidebar */}
        <main className="flex-1 flex flex-col relative">
          {children}
          
          {/* Floating Playground Button */}
          <Link
            href="/playground/audio"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            <span>Playground</span>
          </Link>
        </main>
      </div>
    </ConvexClientProvider>
  );
}
