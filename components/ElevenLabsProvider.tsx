"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

interface ElevenLabsContextType {
  voices: Voice[];
  selectedVoice: Voice | null;
  setSelectedVoice: (voice: Voice | null) => void;
  isLoadingVoices: boolean;
  fetchVoices: () => Promise<void>;
  generateSpeech: (text: string, voiceId?: string) => Promise<string | null>;
  isGeneratingSpeech: boolean;
  getSignedUrl: (agentId: string) => Promise<string | null>;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | null>(null);

export function useElevenLabs() {
  const context = useContext(ElevenLabsContext);
  if (!context) {
    throw new Error("useElevenLabs must be used within an ElevenLabsProvider");
  }
  return context;
}

interface ElevenLabsProviderProps {
  children: ReactNode;
}

export function ElevenLabsProvider({ children }: ElevenLabsProviderProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);

  const fetchVoices = useCallback(async () => {
    setIsLoadingVoices(true);
    try {
      const response = await fetch("/api/elevenlabs/voices");
      if (!response.ok) {
        throw new Error("Failed to fetch voices");
      }
      const data = await response.json();
      setVoices(data.voices || []);
    } catch (error) {
      console.error("Error fetching voices:", error);
    } finally {
      setIsLoadingVoices(false);
    }
  }, []);

  const generateSpeech = useCallback(async (text: string, voiceId?: string): Promise<string | null> => {
    setIsGeneratingSpeech(true);
    try {
      const response = await fetch("/api/elevenlabs/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceId: voiceId || selectedVoice?.voice_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
    } catch (error) {
      console.error("Error generating speech:", error);
      return null;
    } finally {
      setIsGeneratingSpeech(false);
    }
  }, [selectedVoice]);

  const getSignedUrl = useCallback(async (agentId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/elevenlabs/signed-url?agentId=${agentId}`);
      if (!response.ok) {
        throw new Error("Failed to get signed URL");
      }
      const data = await response.json();
      return data.signed_url;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }
  }, []);

  return (
    <ElevenLabsContext.Provider
      value={{
        voices,
        selectedVoice,
        setSelectedVoice,
        isLoadingVoices,
        fetchVoices,
        generateSpeech,
        isGeneratingSpeech,
        getSignedUrl,
      }}
    >
      {children}
    </ElevenLabsContext.Provider>
  );
}
