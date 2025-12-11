"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Skull,
  Send,
  Users,
  Mic,
  MicOff,
  Volume2,
  Loader2,
  LogOut,
  MessageSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { getAdventureById } from "@/config/adventures";
import { useDungeonVoice } from "@/hooks/use-dungeon-voice";

export default function PlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = (params.code as string).toUpperCase();
  const playerId = searchParams.get("playerId") as Id<"dungeonPlayers"> | null;
  const sessionId = searchParams.get("sessionId") as Id<"dungeonSessions"> | null;

  const [action, setAction] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sessionState = useQuery(
    api.dungeon.getSessionState,
    sessionId ? { sessionId } : "skip"
  );
  const logPlayerAction = useMutation(api.dungeon.logPlayerAction);
  const playerHeartbeat = useMutation(api.dungeon.playerHeartbeat);
  const leaveSession = useMutation(api.dungeon.leaveSession);

  const eventsEndRef = useRef<HTMLDivElement>(null);

  // Get adventure for prompts
  const adventure = sessionState?.session
    ? getAdventureById(sessionState.session.adventureId)
    : null;

  // Build system prompt with game context
  const buildSystemPrompt = useCallback(() => {
    if (!sessionState?.session || !adventure) return "";
    const playerNames = sessionState.players
      .map((p) => `${p.avatar} ${p.name}`)
      .join(", ");
    const currentPlayer = sessionState.players.find((p) => p._id === playerId);

    return `
${adventure.systemPrompt}

---
CURRENT SESSION INFO:
- Adventure: ${adventure.name}
- Players: ${playerNames}
- Currently speaking: ${currentPlayer?.name || "Unknown"}
---
`.trim();
  }, [sessionState, adventure, playerId]);

  // Voice hook for player interaction
  const {
    status: voiceStatus,
    isListening,
    isProcessing,
    isSpeaking,
    error: voiceError,
    currentTranscript,
    partialTranscript,
    startListening,
    stopListening,
    sendMessage,
  } = useDungeonVoice({
    sessionId: sessionId || ("" as Id<"dungeonSessions">),
    systemPrompt: buildSystemPrompt(),
    voiceId: "JBFqnCBsd6RMkjVDRZzb", // George - dramatic voice
    playerId: playerId || undefined,
  });

  // Show live transcript (partial while speaking, final when committed)
  const displayTranscript = partialTranscript || currentTranscript;

  // Check if it's this player's turn
  const isMyTurn =
    sessionState?.session?.activePlayerId === playerId &&
    sessionState?.session?.turnPhase === "player_turn";

  // Auto-start recording when it becomes this player's turn
  useEffect(() => {
    if (isMyTurn && !isListening && !isProcessing && !isSpeaking) {
      // Small delay to let UI update first
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isMyTurn, isListening, isProcessing, isSpeaking, startListening]);

  // Heartbeat to keep player active
  useEffect(() => {
    if (!playerId) return;

    const interval = setInterval(() => {
      playerHeartbeat({ playerId });
    }, 30000);

    playerHeartbeat({ playerId });

    return () => clearInterval(interval);
  }, [playerId, playerHeartbeat]);

  // Auto-scroll to latest events
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionState?.events]);

  // Handle leaving
  const handleLeave = async () => {
    if (isListening) stopListening();
    if (playerId) {
      await leaveSession({ playerId });
      localStorage.removeItem(`dungeon-player-${code}`);
    }
    router.push(`/join/${code}`);
  };

  // Handle voice toggle
  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Handle sending text action
  const handleSendAction = async () => {
    if (!action.trim() || !sessionId || !playerId) return;

    setIsSending(true);
    try {
      // If it's my turn, send to DM for response
      if (isMyTurn) {
        await sendMessage(action.trim());
      } else {
        // Just log the action
        await logPlayerAction({
          sessionId,
          playerId,
          content: action.trim(),
        });
      }
      setAction("");
    } finally {
      setIsSending(false);
    }
  };

  if (!playerId || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Invalid session. Please rejoin.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/join/${code}`)}
            >
              Return to Join Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionState === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading game...</span>
        </div>
      </div>
    );
  }

  if (!sessionState?.session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Skull className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Session Ended</h1>
            <p className="text-muted-foreground text-sm">
              The investigation has concluded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, players, events } = sessionState;
  const currentPlayer = players.find((p) => p._id === playerId);
  const activePlayer = session.activePlayerId
    ? players.find((p) => p._id === session.activePlayerId)
    : null;
  const isLobby = session.status === "lobby";
  const isPlaying = session.status === "playing";
  const isPaused = session.status === "paused";

  const recentEvents = events.slice(-20);
  const lastNarration = session.lastNarration;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="shrink-0 border-b bg-background/95 backdrop-blur px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 ring-1 ring-red-500/20">
              <Skull className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-semibold">Murder Mystery</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {players.filter((p) => p.isActive).length} detectives
                </span>
                <span>•</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                    isPlaying && "bg-green-500/10 text-green-600",
                    isLobby && "bg-amber-500/10 text-amber-600",
                    isPaused && "bg-blue-500/10 text-blue-600"
                  )}
                >
                  {isPlaying ? "Live" : isLobby ? "Waiting" : isPaused ? "Paused" : session.status}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLeave}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Your Turn Banner */}
      {isMyTurn && (
        <div className="shrink-0 bg-gradient-to-r from-primary to-orange-500 text-primary-foreground px-4 py-3">
          <div className="flex items-center justify-center gap-2 font-semibold">
            <Mic className="h-5 w-5 animate-pulse" />
            <span>IT&apos;S YOUR TURN - SPEAK NOW!</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLobby ? (
          // Lobby View
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-4xl">{currentPlayer?.avatar || "🕵️"}</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentPlayer?.name || "Detective"}</h2>
                <p className="text-muted-foreground text-sm">Waiting for host to start...</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {players.filter((p) => p.isActive).length} detectives ready
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Game View
          <>
            {/* Current Turn Indicator */}
            {activePlayer && !isMyTurn && (
              <div className="shrink-0 bg-secondary/50 border-b px-4 py-2 text-center">
                <span className="text-sm text-muted-foreground">
                  {activePlayer.avatar} <strong>{activePlayer.name}</strong> is speaking...
                </span>
              </div>
            )}

            {/* Voice Controls (only when it's your turn) */}
            {isMyTurn && (
              <div className="shrink-0 bg-primary/5 border-b px-4 py-4">
                <div className="flex flex-col items-center gap-3">
                  {/* Voice Visualizer */}
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center transition-all",
                      isSpeaking
                        ? "bg-gradient-to-br from-red-500 to-red-700 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                        : isListening
                          ? "bg-gradient-to-br from-green-500 to-green-700 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                          : isProcessing
                            ? "bg-gradient-to-br from-amber-500 to-amber-700 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            : "bg-gradient-to-br from-primary to-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    )}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : isSpeaking ? (
                      <Volume2 className="h-8 w-8 text-white animate-pulse" />
                    ) : isListening ? (
                      <Mic className="h-8 w-8 text-white" />
                    ) : (
                      <MicOff className="h-8 w-8 text-white" />
                    )}
                  </div>

                  {/* Current transcript */}
                  {currentTranscript && (isListening || isProcessing) && (
                    <p className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full max-w-[80%] truncate">
                      "{currentTranscript}"
                    </p>
                  )}

                  {/* Voice Status */}
                  <p className="text-sm font-medium">
                    {isSpeaking
                      ? "DM is responding..."
                      : isListening
                        ? "Listening - speak now!"
                        : isProcessing
                          ? "Thinking..."
                          : "Press to speak"}
                  </p>

                  {/* Voice Error */}
                  {voiceError && (
                    <p className="text-sm text-destructive">{voiceError}</p>
                  )}

                  {/* Voice Controls */}
                  <Button
                    onClick={handleVoiceToggle}
                    disabled={isProcessing || isSpeaking}
                    size="lg"
                    className={cn(
                      "gap-2 rounded-xl",
                      isListening
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-primary to-orange-500"
                    )}
                  >
                    {isListening ? (
                      <>
                        <Square className="h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Start Speaking
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Last Narration Banner */}
            {lastNarration && (
              <div className="shrink-0 bg-red-500/5 border-b border-red-500/10 px-4 py-3">
                <div className="flex items-start gap-2">
                  <Volume2 className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed line-clamp-3">
                    {lastNarration}
                  </p>
                </div>
              </div>
            )}

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {recentEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">The investigation is about to begin...</p>
                </div>
              ) : (
                recentEvents.map((event) => {
                  const eventPlayer = event.playerId
                    ? players.find((p) => p._id === event.playerId)
                    : null;
                  const isOwnAction = event.playerId === playerId;

                  return (
                    <div
                      key={event._id}
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        event.type === "narration" &&
                          "bg-red-500/5 border-l-2 border-red-500",
                        event.type === "player_action" &&
                          (isOwnAction
                            ? "bg-primary/10 border-l-2 border-primary ml-4"
                            : "bg-secondary/50 border-l-2 border-secondary mr-4"),
                        event.type === "scene_change" &&
                          "bg-amber-500/10 border-l-2 border-amber-500 text-center",
                        event.type === "sound_effect" &&
                          "bg-purple-500/10 border-l-2 border-purple-500 text-center italic"
                      )}
                    >
                      {event.type === "player_action" && eventPlayer && (
                        <div className="flex items-center gap-2 mb-1">
                          <span>{eventPlayer.avatar}</span>
                          <span className="font-medium text-xs">
                            {eventPlayer.name}
                            {isOwnAction && " (you)"}
                          </span>
                        </div>
                      )}
                      <p className="leading-relaxed">{event.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })
              )}
              <div ref={eventsEndRef} />
            </div>

            {/* Text Input */}
            {isPlaying && (
              <div className="shrink-0 border-t bg-background p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={isMyTurn ? "Type your response..." : "Type a message (wait for your turn)"}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAction();
                      }
                    }}
                    className="flex-1"
                    disabled={isSending || isProcessing || isSpeaking}
                  />
                  <Button
                    onClick={handleSendAction}
                    disabled={isSending || isProcessing || isSpeaking || !action.trim()}
                    size="icon"
                    className="shrink-0"
                  >
                    {isSending || isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {isPaused && (
              <div className="shrink-0 border-t bg-blue-500/10 p-4 text-center">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Investigation paused by host
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
