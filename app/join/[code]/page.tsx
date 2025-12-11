"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skull, Users, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const AVATARS = ["🕵️", "🔍", "🎭", "🗡️", "🔮", "📜", "🕯️", "🗝️", "💀", "🦇", "🌙", "⚗️"];

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const session = useQuery(api.dungeon.getSessionByCode, { code });
  const joinSession = useMutation(api.dungeon.joinSession);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  // Check for existing player in localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`dungeon-player-${code}`);
    if (stored) {
      const { playerId, sessionId } = JSON.parse(stored);
      router.push(`/join/${code}/play?playerId=${playerId}&sessionId=${sessionId}`);
    }
  }, [code, router]);

  const handleJoin = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!session) {
      setError("Session not found");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      const result = await joinSession({
        code,
        name: name.trim(),
        avatar,
      });

      // Store player info in localStorage for reconnection
      localStorage.setItem(
        `dungeon-player-${code}`,
        JSON.stringify({
          playerId: result.playerId,
          sessionId: result.sessionId,
          name: name.trim(),
          avatar,
        })
      );

      router.push(`/join/${code}/play?playerId=${result.playerId}&sessionId=${result.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setIsJoining(false);
    }
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Skull className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Session Not Found</h1>
            <p className="text-muted-foreground text-sm">
              The game session &quot;{code}&quot; doesn&apos;t exist or has ended.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === "ended") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Skull className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Game Ended</h1>
            <p className="text-muted-foreground text-sm">
              This investigation has concluded.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center mb-4">
            <Skull className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Join Investigation</CardTitle>
          <CardDescription>
            Enter your detective name and choose an avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Code Display */}
          <div className="text-center p-3 rounded-lg bg-secondary/50 ring-1 ring-border/50">
            <span className="text-xs text-muted-foreground block mb-1">Game Code</span>
            <span className="text-2xl font-bold tracking-widest">{code}</span>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input
              placeholder="Detective..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
              maxLength={20}
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Your Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={cn(
                    "h-12 w-12 rounded-lg text-2xl flex items-center justify-center transition-all",
                    avatar === emoji
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "bg-secondary/50 hover:bg-secondary ring-1 ring-border/50"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            disabled={isJoining || !name.trim()}
            className="w-full h-12 text-lg gap-2 shadow-lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Join Investigation
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>

          {/* Session Status */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {session.status === "lobby"
                ? "Waiting for players..."
                : "Investigation in progress"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
