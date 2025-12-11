"use client";

import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download, Loader2, Sparkles, Clock, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SoundEffectsProps {
  className?: string;
}

const EXAMPLE_PROMPTS = [
  "A thunderstorm with heavy rain and distant thunder",
  "Footsteps walking on gravel path",
  "A car engine starting and revving",
  "Birds chirping in a forest at dawn",
  "Ocean waves crashing on a beach",
  "A crackling campfire",
  "Door creaking open slowly",
  "Typing on a mechanical keyboard",
];

export function SoundEffects({ className }: SoundEffectsProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);
  const [promptInfluence, setPromptInfluence] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateSoundEffect = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setAudioUrl(null);
    setProgress(0);

    try {
      const response = await fetch("/api/elevenlabs/sound-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: prompt,
          durationSeconds,
          promptInfluence,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate sound effect");

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error generating sound effect:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, durationSeconds, promptInfluence]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(progress);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current) return;
    const time = (value[0] / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(value[0]);
  }, []);

  const downloadAudio = useCallback(() => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "elevenlabs-sound-effect.mp3";
    a.click();
  }, [audioUrl]);

  const selectExample = useCallback((example: string) => {
    setPrompt(example);
  }, []);

  return (
    <Card className={cn("w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-premium transition-all", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 ring-1 ring-orange-500/10">
            <Sparkles className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <span className="text-lg font-semibold">Sound Effects</span>
            <p className="text-sm text-muted-foreground font-normal">
              Generate sound effects from text descriptions
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Example Prompts */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-muted-foreground" />
            Try an example
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.slice(0, 4).map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => selectExample(example)}
                className="text-xs h-8 rounded-lg border-border/50 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all"
              >
                {example.length > 30 ? example.substring(0, 30) + "..." : example}
              </Button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Describe your sound
          </label>
          <Textarea
            placeholder="Describe the sound effect you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none rounded-xl border-border/50 bg-background/50 transition-all hover:border-orange-500/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          />
        </div>

        {/* Settings */}
        <div className="rounded-xl bg-secondary/30 p-4 space-y-5 ring-1 ring-border/50">
          {/* Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duration (optional)
              </Label>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                {durationSeconds ? `${durationSeconds}s` : "Auto"}
              </span>
            </div>
            <Slider
              value={[durationSeconds ?? 0]}
              onValueChange={([value]) => setDurationSeconds(value === 0 ? undefined : value)}
              min={0}
              max={22}
              step={0.5}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Set to 0 for automatic duration (0.5s - 22s range)
            </p>
          </div>

          {/* Prompt Influence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Prompt Influence</Label>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                {(promptInfluence * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[promptInfluence]}
              onValueChange={([value]) => setPromptInfluence(value)}
              min={0}
              max={1}
              step={0.01}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Higher values follow the prompt more closely
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateSoundEffect}
          disabled={!prompt.trim() || isGenerating}
          className="w-full h-12 gap-2.5 rounded-xl text-base font-medium bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-glow-sm hover:shadow-glow transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating sound effect...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate Sound Effect
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-5 ring-1 ring-orange-500/20">
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />
            
            {/* Waveform-like visual indicator */}
            <div className="flex items-center justify-center gap-1 h-12 mb-2">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full bg-orange-500/30 transition-all duration-150",
                    isPlaying && "animate-pulse"
                  )}
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 50}ms`,
                    opacity: progress > (i / 20) * 100 ? 1 : 0.3,
                    backgroundColor: progress > (i / 20) * 100 ? 'rgb(249 115 22)' : undefined
                  }}
                />
              ))}
            </div>
            
            {/* Progress Bar */}
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="cursor-pointer"
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={togglePlayback}
                className="gap-2.5 h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-glow-sm hover:shadow-glow transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Play
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={downloadAudio}
                className="h-12 w-12 rounded-xl border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
