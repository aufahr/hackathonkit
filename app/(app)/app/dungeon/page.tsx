"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Castle, Play, Users, Sparkles, Skull, Flame } from "lucide-react";
import { adventures, getDefaultAdventure } from "@/config/adventures";
import { HostDashboard } from "@/components/dungeon/host/HostDashboard";
import { cn } from "@/lib/utils";

export default function DungeonPage() {
  const activeSession = useQuery(api.dungeon.getActiveSession);
  const createSession = useMutation(api.dungeon.createSession);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async (adventureId: string) => {
    setIsCreating(true);
    try {
      await createSession({ adventureId });
    } finally {
      setIsCreating(false);
    }
  };

  // If there's an active session, show the dashboard
  if (activeSession?.session) {
    return <HostDashboard />;
  }

  // Otherwise show adventure selection with dungeon theme
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 min-h-screen dungeon-theme dungeon-bg relative overflow-hidden">
      {/* Atmospheric fog overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 to-transparent" />
      </div>

      {/* Torch glow effects on sides */}
      <div className="absolute left-8 top-1/4 w-4 h-4 rounded-full bg-amber-500/60 blur-xl animate-torch-flicker" />
      <div
        className="absolute right-8 top-1/4 w-4 h-4 rounded-full bg-amber-500/60 blur-xl animate-torch-flicker"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="absolute left-12 top-2/3 w-3 h-3 rounded-full bg-orange-500/50 blur-lg animate-torch-flicker"
        style={{ animationDelay: "0.4s" }}
      />
      <div
        className="absolute right-12 top-2/3 w-3 h-3 rounded-full bg-orange-500/50 blur-lg animate-torch-flicker"
        style={{ animationDelay: "0.1s" }}
      />

      <div className="max-w-4xl mx-auto w-full space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          {/* Main Icon - Castle/Dungeon */}
          <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 border-2 border-amber-500/40 flex items-center justify-center ember-glow">
            <Castle className="h-12 w-12 text-amber-400" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-5xl font-bold tracking-tight dungeon-title">Dungeon</h1>
            <p className="text-lg dungeon-subtitle max-w-lg mx-auto">
              Enter the realm of mystery & adventure. Host immersive multiplayer games where an AI
              narrator guides you through epic quests.
            </p>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="dungeon-divider w-20" />
            <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
            <div className="dungeon-divider w-20" />
          </div>
        </div>

        {/* Adventure Selection */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center text-amber-100/90 tracking-wide">
            Choose Your Quest
          </h2>
          <div className="grid gap-5 md:grid-cols-1 max-w-2xl mx-auto">
            {adventures.map((adventure) => {
              const Icon = adventure.icon;
              return (
                <Card
                  key={adventure.id}
                  className={cn(
                    "relative overflow-hidden transition-all cursor-pointer group",
                    "dungeon-card rounded-xl hover:scale-[1.02] hover:border-amber-500/50",
                  )}
                  onClick={() => handleCreateSession(adventure.id)}
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner flames */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 bg-gradient-to-br from-amber-500/40 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-bl from-amber-500/40 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                  <CardHeader className="pb-3 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {/* Game Icon */}
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-600/30 to-red-800/20 ring-2 ring-red-500/30 group-hover:ring-red-500/50 transition-all group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                          <Icon className="h-7 w-7 text-red-400 group-hover:text-red-300 transition-colors" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-amber-50 group-hover:text-amber-100 transition-colors">
                            {adventure.name}
                          </CardTitle>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium ring-1",
                                adventure.difficulty === "easy" &&
                                  "bg-green-500/20 text-green-400 ring-green-500/30",
                                adventure.difficulty === "medium" &&
                                  "bg-amber-500/20 text-amber-400 ring-amber-500/30",
                                adventure.difficulty === "hard" &&
                                  "bg-red-500/20 text-red-400 ring-red-500/30",
                              )}
                            >
                              {adventure.difficulty}
                            </span>
                            <span className="text-xs text-stone-400">
                              {adventure.estimatedTime}
                            </span>
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {adventure.minPlayers}-{adventure.maxPlayers}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={isCreating}
                        className="gap-2 dungeon-btn rounded-lg px-4"
                      >
                        <Play className="h-4 w-4" />
                        Host
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 relative">
                    <CardDescription className="text-sm text-stone-400 leading-relaxed">
                      {adventure.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center justify-center gap-10 text-sm pt-4">
          <div className="flex items-center gap-2 text-amber-200/70">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>AI Narrator</span>
          </div>
          <div className="flex items-center gap-2 text-amber-200/70">
            <Users className="h-4 w-4 text-amber-400" />
            <span>Multiplayer</span>
          </div>
          <div className="flex items-center gap-2 text-amber-200/70">
            <Skull className="h-4 w-4 text-red-400" />
            <span>Mystery & Intrigue</span>
          </div>
        </div>
      </div>
    </div>
  );
}
