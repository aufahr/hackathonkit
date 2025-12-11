"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import type { CharacterAlignmentResponseModel } from "@elevenlabs/elevenlabs-js/api/types/CharacterAlignmentResponseModel"

export type TranscriptWord = {
  kind: "word"
  text: string
  startTime: number
  endTime: number
  startIndex: number
  endIndex: number
  segmentIndex: number
}

export type TranscriptGap = {
  kind: "gap"
  text: string
  startTime: number
  endTime: number
  segmentIndex: number
}

export type TranscriptSegment = TranscriptWord | TranscriptGap

export type SegmentComposer = (
  segments: TranscriptSegment[]
) => TranscriptSegment[]

export type UseTranscriptViewerResult = {
  audioRef: React.RefObject<HTMLAudioElement | null>
  segments: TranscriptSegment[]
  spokenSegments: TranscriptSegment[]
  unspokenSegments: TranscriptSegment[]
  currentWord: TranscriptWord | null
  currentTime: number
  duration: number
  isPlaying: boolean
  isScrubbing: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  seekToTime: (time: number) => void
  seekToWord: (word: TranscriptWord) => void
  startScrubbing: () => void
  endScrubbing: () => void
  getActiveWordIndex: () => number
}

type UseTranscriptViewerOptions = {
  alignment: CharacterAlignmentResponseModel
  hideAudioTags?: boolean
  segmentComposer?: SegmentComposer
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (time: number) => void
  onEnded?: () => void
  onDurationChange?: (duration: number) => void
}

export function useTranscriptViewer({
  alignment,
  hideAudioTags = true,
  segmentComposer,
  onPlay,
  onPause,
  onTimeUpdate,
  onEnded,
  onDurationChange,
}: UseTranscriptViewerOptions): UseTranscriptViewerResult {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isScrubbing, setIsScrubbing] = useState(false)

  // Parse alignment data into segments
  const segments: TranscriptSegment[] = useMemo(() => {
    const result: TranscriptSegment[] = []
    let segmentIndex = 0
    
    if (alignment?.characters && alignment?.characterStartTimesSeconds && alignment?.characterEndTimesSeconds) {
      const chars = alignment.characters
      const startTimes = alignment.characterStartTimesSeconds
      const endTimes = alignment.characterEndTimesSeconds
      
      let wordStart = 0
      let wordStartTime = startTimes[0] || 0
      
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === " " || i === chars.length - 1) {
          const endIndex = i === chars.length - 1 ? i + 1 : i
          const text = chars.slice(wordStart, endIndex).join("")
          
          if (text.trim()) {
            result.push({
              kind: "word",
              text: text.trim(),
              startTime: wordStartTime,
              endTime: endTimes[endIndex - 1] || 0,
              startIndex: wordStart,
              endIndex: endIndex,
              segmentIndex: segmentIndex++,
            })
          }
          
          // Add gap (space) between words
          if (chars[i] === " " && i < chars.length - 1) {
            result.push({
              kind: "gap",
              text: " ",
              startTime: endTimes[i - 1] || 0,
              endTime: startTimes[i + 1] || 0,
              segmentIndex: segmentIndex++,
            })
          }
          
          wordStart = i + 1
          wordStartTime = startTimes[i + 1] || 0
        }
      }
    }
    
    return result
  }, [alignment])

  const finalSegments = useMemo(() => {
    return segmentComposer ? segmentComposer(segments) : segments
  }, [segments, segmentComposer])

  // Calculate spoken/unspoken segments based on current time
  const { spokenSegments, unspokenSegments, currentWord } = useMemo(() => {
    const spoken: TranscriptSegment[] = []
    const unspoken: TranscriptSegment[] = []
    let current: TranscriptWord | null = null

    for (const segment of finalSegments) {
      if (segment.kind === "word") {
        if (currentTime >= segment.endTime) {
          spoken.push(segment)
        } else if (currentTime >= segment.startTime && currentTime < segment.endTime) {
          current = segment
        } else {
          unspoken.push(segment)
        }
      } else {
        // For gaps, determine based on surrounding context
        if (currentTime >= segment.endTime) {
          spoken.push(segment)
        } else {
          unspoken.push(segment)
        }
      }
    }

    return { spokenSegments: spoken, unspokenSegments: unspoken, currentWord: current }
  }, [finalSegments, currentTime])

  const play = useCallback(() => {
    audioRef.current?.play()
    setIsPlaying(true)
    onPlay?.()
  }, [onPlay])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    onPause?.()
  }, [onPause])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }
  }, [onTimeUpdate])

  const seekToWord = useCallback((word: TranscriptWord) => {
    seek(word.startTime)
  }, [seek])

  const seekToTime = useCallback((time: number) => {
    seek(time)
  }, [seek])

  const startScrubbing = useCallback(() => {
    setIsScrubbing(true)
  }, [])

  const endScrubbing = useCallback(() => {
    setIsScrubbing(false)
  }, [])

  const getActiveWordIndex = useCallback(() => {
    for (let i = 0; i < finalSegments.length; i++) {
      const segment = finalSegments[i]
      if (segment.kind === "word" && currentTime >= segment.startTime && currentTime <= segment.endTime) {
        return i
      }
    }
    return -1
  }, [finalSegments, currentTime])

  return {
    audioRef,
    segments: finalSegments,
    spokenSegments,
    unspokenSegments,
    currentWord,
    currentTime,
    duration,
    isPlaying,
    isScrubbing,
    play,
    pause,
    toggle,
    seek,
    seekToTime,
    seekToWord,
    startScrubbing,
    endScrubbing,
    getActiveWordIndex,
  }
}
