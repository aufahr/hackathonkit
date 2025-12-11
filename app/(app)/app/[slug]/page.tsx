"use client";

import { useParams } from "next/navigation";
import { getAppBySlug } from "@/config/apps";
import { notFound } from "next/navigation";

export default function AppPage() {
  const params = useParams();
  const slug = params.slug as string;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const AppIcon = app.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* Empty State - Clean Canvas */}
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
          <AppIcon className="h-7 w-7 text-muted-foreground/50" />
        </div>
        
        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground/80">
            {app.name}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {app.description}
          </p>
        </div>

        {/* Build hint */}
        <div className="pt-4">
          <p className="text-xs text-muted-foreground/70">
            Edit <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">app/(app)/app/[slug]/page.tsx</code> to customize
          </p>
        </div>
      </div>
    </div>
  );
}
