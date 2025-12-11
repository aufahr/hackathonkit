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
  const viewer = await fetchQuery(
    api.users.viewer,
    {},
    { token: await convexAuthNextjsToken() },
  );

  return (
    <ConvexClientProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        {/* Minimal Header */}
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <Box className="w-3.5 h-3.5 text-background" />
            </div>
          </Link>
          
          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu>{viewer.name}</UserMenu>
          </div>
        </header>

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
