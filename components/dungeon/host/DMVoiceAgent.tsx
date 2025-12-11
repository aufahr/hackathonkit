"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  Play,
  Square,
  Volume2,
  Loader2,
  ChevronDown,
  ChevronUp,
  ScrollText,
  AlertCircle,
  Sparkles,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import type { Adventure } from "@/config/adventures";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDungeonVoice, type DungeonVoiceStatus } from "@/hooks/use-dungeon-voice";

interface DMVoiceAgentProps {
  sessionId: Id<"dungeonSessions">;
  adventure: Adventure;
  players: Doc<"dungeonPlayers">[];
  isPlaying: boolean;
}

export function DMVoiceAgent({
  sessionId,
  adventure,
  players,
  isPlaying,
}: DMVoiceAgentProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Build the full prompt with session context
  const playerNames = players.map((p) => `${p.avatar} ${p.name}`).join(", ");
  const fullPrompt = `
${adventure.systemPrompt}

---
CURRENT SESSION INFO:
- Adventure: ${adventure.name}
- Players in this session: ${playerNames || "No players yet - wait for players to join"}
- Number of players: ${players.length}
---
`.trim();

  const {
    status,
    isListening,
    isProcessing,
    isSpeaking,
    error,
    messages,
    currentTranscript,
    startListening,
    stopListening,
    sendMessage,
  } = useDungeonVoice({
    sessionId,
    systemPrompt: fullPrompt,
    voiceId: "JBFqnCBsd6RMkjVDRZzb", // George - dramatic voice
    onResponse: (text) => {
      console.log("Oracle Response:", text);
    },
    onError: (err) => {
      console.error("Oracle Error:", err);
    },
  });

  // Auto-speak intro when game starts
  const speakIntro = useCallback(async () => {
    if (!hasStarted && isPlaying && players.length > 0) {
      setHasStarted(true);
      // Send intro prompt to get the Oracle started
      await sendMessage(adventure.introPrompt);
    }
  }, [hasStarted, isPlaying, players.length, sendMessage, adventure.introPrompt]);

  const handleStartSession = useCallback(async () => {
    await speakIntro();
  }, [speakIntro]);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const isActive = hasStarted && status !== "error";
  const canStart = isPlaying && players.length > 0 && !hasStarted;

  return (
    <Card className="dungeon-card rounded-xl h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-amber-100">
            <Eye className="h-4 w-4 text-violet-400" />
            The Oracle
          </CardTitle>
          <StatusBadge status={status} hasStarted={hasStarted} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Crystal Ball Visualizer */}
        <div className="relative flex-1 min-h-[200px] flex items-center justify-center rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 ring-1 ring-amber-500/20 overflow-hidden">
          {/* Mystical background effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Ambient glow spots */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          </div>

          {/* Outer crystal ring */}
          <div
            className={cn(
              "absolute h-36 w-36 rounded-full border-2 transition-all duration-700",
              isActive
                ? "border-violet-500/30"
                : "border-stone-700/50"
            )}
          />
          <div
            className={cn(
              "absolute h-44 w-44 rounded-full border transition-all duration-700",
              isActive
                ? "border-violet-500/15"
                : "border-stone-800/30"
            )}
          />

          {/* Crystal Ball Orb */}
          <div
            className={cn(
              "relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500",
              isSpeaking
                ? "bg-gradient-to-br from-violet-500 via-purple-600 to-violet-800 text-white scale-110 crystal-glow"
                : isListening
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                  : isProcessing
                    ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                    : isActive
                      ? "bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-[0_0_25px_rgba(124,58,237,0.3)]"
                      : "bg-gradient-to-br from-stone-700 to-stone-800 text-stone-400"
            )}
          >
            {/* Inner crystal shimmer */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/20" />
            
            {isProcessing ? (
              <Loader2 className="h-10 w-10 animate-spin relative z-10" />
            ) : isSpeaking ? (
              <Volume2 className="h-10 w-10 animate-pulse relative z-10" />
            ) : isListening ? (
              <Mic className="h-10 w-10 relative z-10" />
            ) : isActive ? (
              <Sparkles className="h-10 w-10 relative z-10" />
            ) : (
              <MicOff className="h-10 w-10 relative z-10" />
            )}
          </div>

          {/* Speaking animation rings */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="h-32 w-32 animate-ping rounded-full bg-violet-500/20"
                  style={{ animationDuration: "1.5s" }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="h-40 w-40 animate-ping rounded-full bg-purple-500/10"
                  style={{ animationDuration: "2s", animationDelay: "0.5s" }}
                />
              </div>
            </>
          )}

          {/* Listening animation rings */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="h-32 w-32 animate-ping rounded-full bg-emerald-500/20"
                style={{ animationDuration: "2s" }}
              />
            </div>
          )}

          {/* Status text */}
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full",
                isSpeaking
                  ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
                  : isListening
                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                    : isProcessing
                      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                      : "bg-stone-800/50 text-stone-400"
              )}
            >
              {isSpeaking
                ? "✨ The Oracle speaks..."
                : isListening
                  ? "🎤 Listening to your words..."
                  : isProcessing
                    ? "🔮 Consulting the spirits..."
                    : hasStarted
                      ? "⚡ Awaiting command"
                      : "💀 Dormant"}
            </span>
          </div>

          {/* Current transcript */}
          {currentTranscript && (isListening || isProcessing) && (
            <div className="absolute top-3 left-3 right-3 text-center">
              <span className="text-xs text-amber-200/70 bg-stone-900/80 px-3 py-1.5 rounded-lg ring-1 ring-amber-500/20">
                "{currentTranscript}"
              </span>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3 ring-1 ring-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 shrink-0">
          {!hasStarted ? (
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={!canStart || isProcessing}
              className="gap-2 h-12 px-6 rounded-xl dungeon-btn"
            >
              <Sparkles className="h-4 w-4" />
              {!isPlaying
                ? "Start Quest First"
                : players.length === 0
                  ? "Await Adventurers"
                  : "Awaken the Oracle"}
            </Button>
          ) : (
            <>
              <Button
                size="icon"
                variant={isListening ? "default" : "outline"}
                onClick={handleToggleListening}
                disabled={isProcessing || isSpeaking}
                className={cn(
                  "h-12 w-12 rounded-xl transition-all",
                  isListening 
                    ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-500" 
                    : "border-amber-500/30 hover:border-amber-500/50 hover:bg-stone-800"
                )}
              >
                {isListening ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5 text-amber-400" />
                )}
              </Button>
              <span className="text-sm text-stone-400">
                {isListening
                  ? "Click to stop"
                  : isSpeaking
                    ? "Oracle speaking..."
                    : isProcessing
                      ? "Consulting..."
                      : "Click mic to speak"}
              </span>
            </>
          )}
        </div>

        {/* Message count */}
        {messages.length > 0 && (
          <div className="text-center text-xs text-stone-500">
            {messages.length} visions received
          </div>
        )}

        {/* Scenario Prompt - Collapsible */}
        <Collapsible open={showPrompt} onOpenChange={setShowPrompt}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-stone-400 hover:text-amber-200 hover:bg-stone-800/50"
            >
              <span className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                View Oracle's Knowledge
              </span>
              {showPrompt ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 rounded-xl bg-stone-900/80 p-4 ring-1 ring-amber-500/20 max-h-[300px] overflow-y-auto">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    Opening Incantation
                  </h4>
                  <p className="text-sm text-stone-300 whitespace-pre-wrap">
                    {adventure.introPrompt}
                  </p>
                </div>
                <div className="border-t border-amber-500/20 pt-3">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    Oracle's Knowledge
                  </h4>
                  <pre className="text-xs whitespace-pre-wrap font-mono text-stone-400">
                    {fullPrompt}
                  </pre>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  status,
  hasStarted,
}: {
  status: DungeonVoiceStatus;
  hasStarted: boolean;
}) {
  const isActive = hasStarted && status !== "error";
  const isProcessing = status === "processing";
  const isSpeaking = status === "speaking";
  const isListening = status === "listening";

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition-all",
        isSpeaking &&
          "bg-violet-500/20 text-violet-300 ring-violet-500/30",
        isListening &&
          "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
        isProcessing &&
          "bg-amber-500/20 text-amber-300 ring-amber-500/30 animate-pulse",
        isActive &&
          !isSpeaking &&
          !isListening &&
          !isProcessing &&
          "bg-violet-500/10 text-violet-300 ring-violet-500/20",
        !isActive && "bg-stone-800 text-stone-400 ring-stone-700"
      )}
    >
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isSpeaking && "bg-violet-400",
            isListening && "bg-emerald-400",
            isProcessing && "bg-amber-400",
            isActive && !isSpeaking && !isListening && !isProcessing && "bg-violet-400",
            !isActive && "bg-stone-500"
          )}
        />
        {isSpeaking
          ? "Speaking"
          : isListening
            ? "Listening"
            : isProcessing
              ? "Thinking"
              : isActive
                ? "Awake"
                : "Dormant"}
      </span>
    </span>
  );
}

