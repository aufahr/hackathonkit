"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, AlertCircle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GameControlsProps {
  sessionId: Id<"dungeonSessions">;
  status: "lobby" | "playing" | "paused" | "ended";
  playerCount: number;
  minPlayers: number;
}

export function GameControls({
  sessionId,
  status,
  playerCount,
  minPlayers,
}: GameControlsProps) {
  const startGame = useMutation(api.dungeon.startGame);
  const pauseGame = useMutation(api.dungeon.pauseGame);
  const endGame = useMutation(api.dungeon.endGame);

  const canStart = playerCount >= minPlayers;

  return (
    <div className="flex items-center gap-2">
      {status === "lobby" && (
        <Button
          onClick={() => startGame({ sessionId })}
          disabled={!canStart}
          className="gap-2 shadow-glow-sm"
        >
          <Play className="h-4 w-4" />
          Start Game
          {!canStart && (
            <span className="text-xs opacity-70">
              (need {minPlayers - playerCount} more)
            </span>
          )}
        </Button>
      )}

      {status === "playing" && (
        <>
          <Button
            variant="outline"
            onClick={() => pauseGame({ sessionId })}
            className="gap-2"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                End Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End the game?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will end the current investigation for all players.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => endGame({ sessionId })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  End Game
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {status === "paused" && (
        <>
          <Button
            onClick={() => pauseGame({ sessionId })}
            className="gap-2 shadow-glow-sm"
          >
            <Play className="h-4 w-4" />
            Resume
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                End Game
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End the game?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will end the current investigation for all players.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => endGame({ sessionId })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  End Game
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
