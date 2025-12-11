"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { PlayerList } from "./PlayerList";
import { GameControls } from "./GameControls";
import { EventLog } from "./EventLog";
import { DMVoiceAgent } from "./DMVoiceAgent";
import { getAdventureById } from "@/config/adventures";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Castle, Flame } from "lucide-react";

export function HostDashboard() {
  const activeSession = useQuery(api.dungeon.getActiveSession);

  if (!activeSession?.session) {
    return (
      <div className="flex-1 flex items-center justify-center dungeon-theme dungeon-bg min-h-screen">
        <div className="flex items-center gap-3 text-amber-200/70">
          <div className="w-5 h-5 rounded-full bg-amber-500/50 animate-pulse" />
          <p>Entering the dungeon...</p>
        </div>
      </div>
    );
  }

  const { session, players, events } = activeSession;
  const adventure = getAdventureById(session.adventureId);

  if (!adventure) {
    return (
      <div className="flex-1 flex items-center justify-center dungeon-theme dungeon-bg min-h-screen">
        <p className="text-amber-200/50">Quest not found in the archives...</p>
      </div>
    );
  }

  const isLobby = session.status === "lobby";
  const isPlaying = session.status === "playing";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden dungeon-theme dungeon-bg min-h-screen">
      {/* Header */}
      <div className="shrink-0 border-b border-amber-500/20 bg-stone-900/80 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Dungeon Icon with glow */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/20 ring-2 ring-amber-500/30 ember-glow">
              <Castle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-amber-50">{adventure.name}</h1>
                <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
              </div>
              <p className="text-sm text-stone-400">
                {isLobby ? "⏳ Gathering adventurers..." : isPlaying ? "⚔️ Quest in progress" : session.status}
              </p>
            </div>
          </div>
          <GameControls
            sessionId={session._id}
            status={session.status}
            playerCount={players.length}
            minPlayers={adventure.minPlayers}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 lg:grid-cols-3 h-full">
          {/* Left Column - QR Code & Players */}
          <div className="space-y-6">
            {isLobby && (
              <QRCodeDisplay code={session.code} />
            )}
            <PlayerList players={players} />
          </div>

          {/* Center Column - DM Voice Agent */}
          <div className="lg:col-span-1">
            <DMVoiceAgent
              sessionId={session._id}
              adventure={adventure}
              players={players}
              isPlaying={isPlaying}
            />
          </div>

          {/* Right Column - Event Log */}
          <div className="lg:col-span-1">
            <EventLog events={events} players={players} />
          </div>
        </div>
      </div>
    </div>
  );
}

