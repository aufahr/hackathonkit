import { Button } from "@/components/ui/button";
import { Box, Github } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function SplashPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 flex h-16 border-b bg-background/80 backdrop-blur-md px-6">
        <nav className="w-full max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <Box className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold">Hackathon Kit</span>
          </Link>
          
          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              href="https://github.com"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
            <Link href="/playground/audio">
              <Button size="sm" className="rounded-full px-4">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex grow flex-col">{children}</main>
    </div>
  );
}
