"use client";

import { useCallback, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationalAIProps {
  agentId?: string;
  className?: string;
}

export function ConversationalAI({ agentId: defaultAgentId, className }: ConversationalAIProps) {
  const [agentId, setAgentId] = useState(defaultAgentId || "");
  const [inputAgentId, setInputAgentId] = useState(defaultAgentId || "");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
    },
    onError: (error) => {
      console.error("Conversation error:", error);
    },
    onMessage: (message) => {
      console.log("Message:", message);
    },
  });

  const { status, isSpeaking } = conversation;

  const getSignedUrl = useCallback(async (): Promise<string> => {
    const response = await fetch(`/api/elevenlabs/signed-url?agentId=${agentId}`);
    if (!response.ok) {
      throw new Error("Failed to get signed URL");
    }
    const data = await response.json();
    return data.signed_url;
  }, [agentId]);

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const signedUrl = await getSignedUrl();
      await conversation.startSession({ signedUrl });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, getSignedUrl]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleVolume = useCallback(() => {
    const newVolume = volume === 0 ? 1 : 0;
    setVolume(newVolume);
    conversation.setVolume({ volume: newVolume });
  }, [volume, conversation]);

  const handleSetAgentId = useCallback(() => {
    setAgentId(inputAgentId);
  }, [inputAgentId]);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <Card className={cn("w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-premium transition-all", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-semibold">Voice Agent</span>
              <p className="text-sm text-muted-foreground font-normal">
                Real-time AI conversation
              </p>
            </div>
          </CardTitle>
          <StatusBadge status={status} isConnecting={isConnecting} isConnected={isConnected} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!agentId ? (
          <AgentSetup 
            inputAgentId={inputAgentId}
            setInputAgentId={setInputAgentId}
            handleSetAgentId={handleSetAgentId}
          />
        ) : (
          <>
            {/* Visualizer */}
            <div className="relative flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 ring-1 ring-border/50 overflow-hidden">
              {/* Background rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={cn(
                  "absolute h-32 w-32 rounded-full border border-primary/10 transition-all duration-500",
                  isConnected && "border-primary/20"
                )} />
                <div className={cn(
                  "absolute h-44 w-44 rounded-full border border-primary/5 transition-all duration-500",
                  isConnected && "border-primary/10"
                )} />
              </div>
              
              {/* Main orb */}
              <div 
                className={cn(
                  "relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300",
                  isConnected 
                    ? isSpeaking 
                      ? "bg-gradient-to-br from-primary to-orange-500 text-primary-foreground scale-110 shadow-glow" 
                      : "bg-gradient-to-br from-primary to-orange-500 text-primary-foreground shadow-glow-sm"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isConnected ? (
                  isSpeaking ? (
                    <Volume2 className="h-8 w-8 animate-pulse" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )
                ) : (
                  <MicOff className="h-8 w-8" />
                )}
              </div>
              
              {/* Speaking animation rings */}
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-28 w-28 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '1.5s' }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-36 w-36 animate-ping rounded-full bg-primary/10" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                  </div>
                </>
              )}
              
              {/* Status text */}
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className={cn(
                  "text-xs font-medium px-3 py-1 rounded-full",
                  isConnected 
                    ? isSpeaking 
                      ? "bg-primary/20 text-primary" 
                      : "bg-green-500/20 text-green-600 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {isConnected 
                    ? isSpeaking 
                      ? "AI is speaking..." 
                      : "Listening..."
                    : "Ready to connect"
                  }
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isConnected ? (
                <Button
                  size="lg"
                  onClick={startConversation}
                  disabled={isConnecting}
                  className="gap-2.5 h-12 px-8 rounded-xl text-base font-medium shadow-glow-sm hover:shadow-glow transition-all"
                >
                  <Phone className="h-5 w-5" />
                  {isConnecting ? "Connecting..." : "Start Conversation"}
                </Button>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant={isMuted ? "default" : "outline"}
                    onClick={toggleMute}
                    className={cn(
                      "h-14 w-14 rounded-2xl transition-all",
                      isMuted 
                        ? "shadow-glow-sm" 
                        : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={endConversation}
                    className="gap-2.5 h-14 px-8 rounded-2xl text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <PhoneOff className="h-5 w-5" />
                    End Call
                  </Button>
                  <Button
                    size="icon"
                    variant={volume === 0 ? "default" : "outline"}
                    onClick={toggleVolume}
                    className={cn(
                      "h-14 w-14 rounded-2xl transition-all",
                      volume === 0 
                        ? "shadow-glow-sm" 
                        : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                </>
              )}
            </div>

            {/* Agent Info */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4 ring-1 ring-border/50">
              <div className="text-sm">
                <span className="text-muted-foreground">Agent ID: </span>
                <code className="rounded-lg bg-muted px-2 py-1 text-xs font-medium font-mono">{agentId}</code>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAgentId("")}
                disabled={isConnected}
                className="text-muted-foreground hover:text-foreground"
              >
                Change
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ 
  status, 
  isConnecting, 
  isConnected 
}: { 
  status: string; 
  isConnecting: boolean; 
  isConnected: boolean;
}) {
  return (
    <span 
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-all",
        isConnected && "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        isConnecting && "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20 animate-pulse",
        !isConnected && !isConnecting && "bg-secondary text-muted-foreground ring-border/50"
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          isConnected && "bg-green-500",
          isConnecting && "bg-amber-500",
          !isConnected && !isConnecting && "bg-muted-foreground"
        )} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </span>
  );
}

function AgentSetup({ 
  inputAgentId, 
  setInputAgentId, 
  handleSetAgentId 
}: { 
  inputAgentId: string; 
  setInputAgentId: (value: string) => void; 
  handleSetAgentId: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Settings2 className="h-4 w-4" />
        </div>
        Configure your agent
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Enter your Agent ID"
          value={inputAgentId}
          onChange={(e) => setInputAgentId(e.target.value)}
          className="flex-1 h-11 rounded-xl border-border/50 bg-background/50 transition-all hover:border-primary/30 focus:border-primary"
        />
        <Button 
          onClick={handleSetAgentId} 
          disabled={!inputAgentId}
          className="h-11 px-6 rounded-xl shadow-glow-sm hover:shadow-glow transition-all"
        >
          Set Agent
        </Button>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-accent/80 to-accent/40 p-4 ring-1 ring-border/50">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Need an Agent ID?</p>
            <p className="text-xs text-muted-foreground">
              Create one at{" "}
              <a 
                href="https://elevenlabs.io/conversational-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                elevenlabs.io/conversational-ai
                <ArrowRight className="h-3 w-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
