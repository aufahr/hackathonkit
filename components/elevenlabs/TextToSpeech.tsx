"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, Pause, Download, Loader2, Volume2, RefreshCw, Mic, Wand2, Settings2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

interface TextToSpeechProps {
  className?: string;
}

const VOICE_MODELS = [
  { id: "eleven_multilingual_v2", name: "Multilingual v2", description: "Best quality, 29 languages" },
  { id: "eleven_turbo_v2_5", name: "Turbo v2.5", description: "Low latency, 32 languages" },
  { id: "eleven_turbo_v2", name: "Turbo v2", description: "Low latency, English only" },
  { id: "eleven_monolingual_v1", name: "Monolingual v1", description: "English only, legacy" },
  { id: "eleven_multilingual_v1", name: "Multilingual v1", description: "Experimental, legacy" },
];

export function TextToSpeech({ className }: TextToSpeechProps) {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("eleven_multilingual_v2");
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Voice settings
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchVoices = useCallback(async () => {
    setIsLoadingVoices(true);
    try {
      const response = await fetch("/api/elevenlabs/voices");
      if (!response.ok) throw new Error("Failed to fetch voices");
      const data = await response.json();
      setVoices(data.voices || []);
      if (data.voices?.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(data.voices[0].voice_id);
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
    } finally {
      setIsLoadingVoices(false);
    }
  }, [selectedVoiceId]);

  useEffect(() => {
    fetchVoices();
  }, []);

  const generateSpeech = useCallback(async () => {
    if (!text.trim() || !selectedVoiceId) return;

    setIsGenerating(true);
    setAudioUrl(null);
    setProgress(0);

    try {
      const response = await fetch("/api/elevenlabs/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: selectedVoiceId,
          modelId: selectedModelId,
          stability,
          similarityBoost,
          style,
          speakerBoost,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate speech");

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [text, selectedVoiceId, selectedModelId, stability, similarityBoost, style, speakerBoost]);

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
    a.download = "elevenlabs-speech.mp3";
    a.click();
  }, [audioUrl]);

  const selectedVoice = voices.find((v) => v.voice_id === selectedVoiceId);

  return (
    <Card className={cn("w-full border-border/50 bg-card/50 backdrop-blur-sm shadow-premium transition-all", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
            <Volume2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="text-lg font-semibold">Text to Speech</span>
            <p className="text-sm text-muted-foreground font-normal">
              Convert text into natural-sounding speech
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mic className="h-4 w-4 text-muted-foreground" />
            Voice Selection
          </label>
          <div className="flex gap-2">
            <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
              <SelectTrigger className="flex-1 h-11 rounded-xl border-border/50 bg-background/50 transition-all hover:border-primary/30 focus:border-primary">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                {voices.map((voice) => (
                  <SelectItem 
                    key={voice.voice_id} 
                    value={voice.voice_id}
                    className="rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                        {voice.category}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchVoices}
              disabled={isLoadingVoices}
              className="h-11 w-11 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <RefreshCw className={cn("h-4 w-4", isLoadingVoices && "animate-spin")} />
            </Button>
          </div>
          {selectedVoice?.labels && Object.keys(selectedVoice.labels).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(selectedVoice.labels).map(([key, value]) => (
                <span 
                  key={key} 
                  className="rounded-full bg-gradient-to-r from-secondary to-secondary/80 px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-muted-foreground" />
            Voice Model
          </label>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="w-full h-11 rounded-xl border-border/50 bg-background/50 transition-all hover:border-primary/30 focus:border-primary">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {VOICE_MODELS.map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  className="rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Settings */}
        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-11 justify-between rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Voice Settings
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showSettings && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-5">
            <div className="rounded-xl bg-secondary/30 p-4 space-y-5 ring-1 ring-border/50">
              {/* Stability */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Stability</Label>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {(stability * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[stability]}
                  onValueChange={([value]) => setStability(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Higher stability makes the voice more consistent but less expressive
                </p>
              </div>

              {/* Similarity Boost */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Similarity Boost</Label>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {(similarityBoost * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[similarityBoost]}
                  onValueChange={([value]) => setSimilarityBoost(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values make the voice closer to the original but may reduce quality
                </p>
              </div>

              {/* Style */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Style Exaggeration</Label>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {(style * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[style]}
                  onValueChange={([value]) => setStyle(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Amplifies the style of the original speaker (may increase latency)
                </p>
              </div>

              {/* Speaker Boost */}
              <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Speaker Boost</Label>
                  <p className="text-xs text-muted-foreground">
                    Boost similarity to the original speaker
                  </p>
                </div>
                <Switch
                  checked={speakerBoost}
                  onCheckedChange={setSpeakerBoost}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Text Input */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-muted-foreground" />
            Your Text
          </label>
          <Textarea
            placeholder="Enter the text you want to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="resize-none rounded-xl border-border/50 bg-background/50 transition-all hover:border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={cn(
              "transition-colors",
              text.length > 4500 && "text-orange-500",
              text.length > 4900 && "text-destructive"
            )}>
              {text.length.toLocaleString()} characters
            </span>
            <span>Max: 5,000</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateSpeech}
          disabled={!text.trim() || !selectedVoiceId || isGenerating}
          className="w-full h-12 gap-2.5 rounded-xl text-base font-medium shadow-glow-sm hover:shadow-glow transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating audio...
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              Generate Speech
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-4 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 p-5 ring-1 ring-border/50">
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
                    "w-1 rounded-full bg-primary/30 transition-all duration-150",
                    isPlaying && "animate-pulse"
                  )}
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 50}ms`,
                    opacity: progress > (i / 20) * 100 ? 1 : 0.3,
                    backgroundColor: progress > (i / 20) * 100 ? 'hsl(var(--primary))' : undefined
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
                className="gap-2.5 h-12 px-8 rounded-xl shadow-glow-sm hover:shadow-glow transition-all"
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
                className="h-12 w-12 rounded-xl border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
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
