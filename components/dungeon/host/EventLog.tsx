"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Mic, Users, MapPin, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

interface EventLogProps {
  events: Doc<"dungeonEvents">[];
  players: Doc<"dungeonPlayers">[];
}

export function EventLog({ events, players }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const getPlayerName = (playerId: string | undefined) => {
    if (!playerId) return null;
    const player = players.find((p) => p._id === playerId);
    return player?.name || "Unknown";
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "narration":
        return <Mic className="h-4 w-4 text-violet-400" />;
      case "player_action":
        return <Users className="h-4 w-4 text-emerald-400" />;
      case "scene_change":
        return <MapPin className="h-4 w-4 text-amber-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-stone-500" />;
    }
  };

  return (
    <Card className="dungeon-card rounded-xl h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="flex items-center gap-2 text-base text-amber-100">
          <ScrollText className="h-4 w-4 text-amber-400" />
          Chronicle
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-track-stone-900 scrollbar-thumb-amber-500/30"
          style={{ maxHeight: "400px" }}
        >
          {events.length === 0 ? (
            <div className="text-center py-8">
              <ScrollText className="h-10 w-10 mx-auto mb-3 text-stone-600" />
              <p className="text-sm text-stone-400">The chronicle awaits...</p>
              <p className="text-xs text-stone-500 mt-1">Begin the quest to inscribe your tale</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className={cn(
                  "p-3 rounded-lg text-sm ring-1",
                  event.type === "narration" &&
                    "bg-violet-500/10 ring-violet-500/20 border-l-2 border-violet-500",
                  event.type === "player_action" &&
                    "bg-emerald-500/10 ring-emerald-500/20 border-l-2 border-emerald-500",
                  event.type === "scene_change" &&
                    "bg-amber-500/10 ring-amber-500/20 border-l-2 border-amber-500",
                  event.type === "sound_effect" &&
                    "bg-stone-800/50 ring-stone-700/50"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">
                    {getEventIcon(event.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="leading-relaxed text-stone-200">{event.content}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

