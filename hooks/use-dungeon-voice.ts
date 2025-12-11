"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useScribe } from "./use-scribe";

export type DungeonVoiceStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UseDungeonVoiceOptions {
  sessionId: Id<"dungeonSessions">;
  systemPrompt: string;
  voiceId?: string;
  playerId?: Id<"dungeonPlayers">;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: string) => void;
}

export interface UseDungeonVoiceReturn {
  status: DungeonVoiceStatus;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  error: string | null;
  messages: ChatMessage[];
  currentTranscript: string;
  partialTranscript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

export function useDungeonVoice({
  sessionId,
  systemPrompt,
  voiceId = "JBFqnCBsd6RMkjVDRZzb", // George - dramatic voice
  playerId,
  onTranscript,
  onResponse,
  onError,
}: UseDungeonVoiceOptions): UseDungeonVoiceReturn {
  const [status, setStatus] = useState<DungeonVoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);

  const generateResponse = useAction(api.dmAgent.generateResponse);

  // Real-time transcription with ElevenLabs Scribe
  const scribe = useScribe({
    onPartialTranscript: (data) => {
      // Show live transcription as user speaks
      setCurrentTranscript(data.text);
    },
    onCommittedTranscript: async (data) => {
      // User stopped speaking, process the final transcript
      if (data.text.trim() && !isProcessingRef.current) {
        await processTranscript(data.text.trim());
      }
    },
    onError: (err) => {
      console.error("Scribe error:", err);
      const errorMessage = err instanceof Error ? err.message : "Transcription error";
      handleError(errorMessage);
    },
    onConnect: () => {
      setStatus("listening");
      setError(null);
    },
    onDisconnect: () => {
      if (status === "listening") {
        setStatus("idle");
      }
    },
    // VAD settings for better detection
    commitStrategy: "silence",
    vadSilenceThresholdSecs: 1.5, // Commit after 1.5s of silence
    minSpeechDurationMs: 500, // Minimum 500ms of speech
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (scribe.isConnected) {
        scribe.disconnect();
      }
    };
  }, [scribe]);

  const handleError = useCallback(
    (errorMsg: string) => {
      setError(errorMsg);
      setStatus("error");
      onError?.(errorMsg);
    },
    [onError]
  );

  // Get Scribe token from API
  const getScribeToken = useCallback(async (): Promise<string> => {
    const response = await fetch("/api/elevenlabs/scribe-token");
    if (!response.ok) {
      throw new Error("Failed to get transcription token");
    }
    const data = await response.json();
    return data.token;
  }, []);

  // Process transcript: send to AI and speak response
  const processTranscript = useCallback(
    async (transcript: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        setStatus("processing");
        setCurrentTranscript(transcript);
        onTranscript?.(transcript);

        // Disconnect Scribe while processing
        if (scribe.isConnected) {
          scribe.disconnect();
        }

        // Add user message to history
        const userMessage: ChatMessage = { role: "user", content: transcript };
        setMessages((prev) => [...prev, userMessage]);

        // Get AI response from Convex action
        const result = await generateResponse({
          sessionId,
          userMessage: transcript,
          systemPrompt,
          conversationHistory: messages,
          playerId,
        });

        const aiResponse = result.content || "";
        if (!aiResponse.trim()) {
          setStatus("idle");
          isProcessingRef.current = false;
          return;
        }

        // Add assistant message to history
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: aiResponse,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        onResponse?.(aiResponse);

        // Speak the response with TTS
        setStatus("speaking");
        await speakText(aiResponse);

        setStatus("idle");
        setCurrentTranscript("");
      } catch (err) {
        handleError(err instanceof Error ? err.message : "Processing failed");
      } finally {
        isProcessingRef.current = false;
      }
    },
    [
      generateResponse,
      sessionId,
      systemPrompt,
      messages,
      scribe,
      playerId,
      onTranscript,
      onResponse,
      handleError,
    ]
  );

  // Text-to-speech using ElevenLabs with streaming
  const speakText = useCallback(
    async (text: string): Promise<void> => {
      const response = await fetch("/api/elevenlabs/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId,
          modelId: "eleven_turbo_v2_5", // Faster model for lower latency
          stability: 0.5,
          similarityBoost: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          reject(new Error("Failed to play audio"));
        };

        audio.play().catch(reject);
      });
    },
    [voiceId]
  );

  // Start listening with real-time transcription
  const startListening = useCallback(async () => {
    if (scribe.isConnected || isProcessingRef.current) return;

    try {
      setError(null);
      setCurrentTranscript("");
      setStatus("connecting");

      // Get microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get Scribe token
      const token = await getScribeToken();

      // Connect to Scribe with microphone
      await scribe.connect({
        token,
        modelId: "scribe_v1",
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      handleError(
        err instanceof Error ? err.message : "Failed to start listening"
      );
    }
  }, [scribe, getScribeToken, handleError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (scribe.isConnected) {
      // Commit any pending transcript before disconnecting
      scribe.commit();
      // Small delay to allow commit to process
      setTimeout(() => {
        scribe.disconnect();
      }, 100);
    }
  }, [scribe]);

  // Send a text message directly (without voice)
  const sendMessage = useCallback(
    async (text: string) => {
      if (isProcessingRef.current) return;
      await processTranscript(text);
    },
    [processTranscript]
  );

  // Clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentTranscript("");
  }, []);

  return {
    status,
    isListening: status === "listening" || scribe.isTranscribing,
    isProcessing: status === "processing",
    isSpeaking: status === "speaking",
    error,
    messages,
    currentTranscript,
    partialTranscript: scribe.partialTranscript,
    startListening,
    stopListening,
    sendMessage,
    clearMessages,
  };
}
