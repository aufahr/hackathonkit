"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCircle, Shield, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

interface PlayerListProps {
  players: Doc<"dungeonPlayers">[];
}

export function PlayerList({ players }: PlayerListProps) {
  const activePlayers = players.filter((p) => p.isActive);

  return (
    <Card className="dungeon-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base text-amber-100">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            Adventurers
          </span>
          <span className="text-sm font-normal text-stone-400">
            {activePlayers.length} joined
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activePlayers.length === 0 ? (
          <div className="text-center py-8">
            <UserCircle className="h-14 w-14 mx-auto mb-3 text-stone-600" />
            <p className="text-sm text-stone-400">Awaiting brave souls...</p>
            <p className="text-xs text-stone-500 mt-1">Share the portal above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activePlayers.map((player, index) => (
              <div
                key={player._id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  "bg-stone-800/50 ring-1 ring-amber-500/20 hover:ring-amber-500/40 transition-all"
                )}
              >
                <span className="text-2xl">{player.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-amber-50 truncate">{player.name}</p>
                  <p className="text-xs text-stone-500">
                    Adventurer #{index + 1}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3 w-3 text-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-400/70">Ready</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

