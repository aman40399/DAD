'use client'

import { useState, useEffect, useRef } from 'react'

interface ArticleAudioPlayerProps {
  title: string
  content: string
  language?: string
}

function getCleanSpeechChunks(title: string, content: string): string[] {
  const cleanBody = (content || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[#*_`~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const fullText = `${title}. ${cleanBody}`
  const rawSentences = fullText.split(/(?<=[.!?।॥\n])\s+/)
  const maxChunkLen = 180
  const chunks: string[] = []
  let current = ''

  for (const sentence of rawSentences) {
    const s = sentence.trim()
    if (!s) continue
    if (current.length + s.length + 1 <= maxChunkLen) {
      current = current ? `${current} ${s}` : s
    } else {
      if (current) chunks.push(current)
      if (s.length > maxChunkLen) {
        const words = s.split(/\s+/)
        let sub = ''
        for (const w of words) {
          if (sub.length + w.length + 1 <= maxChunkLen) {
            sub = sub ? `${sub} ${w}` : w
          } else {
            if (sub) chunks.push(sub)
            sub = w
          }
        }
        current = sub
      } else {
        current = s
      }
    }
  }
  if (current) chunks.push(current)
  return chunks
}

function findBestVoice(allVoices: SpeechSynthesisVoice[], isHindi: boolean): SpeechSynthesisVoice | null {
  if (isHindi) {
    return (
      allVoices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('hi')) ||
      allVoices.find((v) => v.name.toLowerCase().includes('hindi')) ||
      null
    )
  }
  return (
    allVoices.find(
      (v) =>
        v.lang.toLowerCase().replace('_', '-').startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Karen'))
    ) ||
    allVoices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('en')) ||
    null
  )
}

export default function ArticleAudioPlayer({ title, content, language }: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [supported, setSupported] = useState(true)
  const [rate, setRate] = useState<1 | 1.25 | 1.5>(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [activeChunk, setActiveChunk] = useState<number>(0)
  const [totalChunks, setTotalChunks] = useState<number>(0)

  const isHindi =
    language === 'hindi' ||
    /[\u0900-\u097F]/.test(title + ' ' + (content || ''))

  const chunksRef = useRef<string[]>([])
  const chunkIndexRef = useRef<number>(0)
  const isCancelledRef = useRef<boolean>(false)
  const isPausedRef = useRef<boolean>(false)
  const rateRef = useRef<1 | 1.25 | 1.5>(1)

  useEffect(() => {
    rateRef.current = rate
  }, [rate])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('speechSynthesis' in window)) {
        setSupported(false)
        return
      }

      const loadVoices = () => {
        const available = window.speechSynthesis.getVoices()
        if (available && available.length > 0) {
          setVoices(available)
        }
      }

      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      isCancelledRef.current = true
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  if (!supported) return null

  const speakChunk = (index: number) => {
    if (isCancelledRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const chunks = chunksRef.current
    if (index >= chunks.length) {
      setIsPlaying(false)
      setIsPaused(false)
      isPausedRef.current = false
      chunkIndexRef.current = 0
      setActiveChunk(0)
      return
    }

    chunkIndexRef.current = index
    setActiveChunk(index + 1)
    const text = chunks[index]
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rateRef.current

    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices()
    const voice = findBestVoice(currentVoices, isHindi)
    if (voice) {
      utterance.voice = voice
    }
    utterance.lang = isHindi ? 'hi-IN' : (voice?.lang || 'en-US')

    utterance.onstart = () => {
      if (isCancelledRef.current) {
        window.speechSynthesis.cancel()
        return
      }
      setIsPlaying(true)
      setIsPaused(false)
      isPausedRef.current = false
    }

    utterance.onend = () => {
      if (isCancelledRef.current || isPausedRef.current) return
      speakChunk(index + 1)
    }

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return
      if (!isCancelledRef.current && !isPausedRef.current) {
        speakChunk(index + 1)
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) return

    if (isPlaying) {
      if (isPaused) {
        isPausedRef.current = false
        setIsPaused(false)
        if (!window.speechSynthesis.speaking) {
          speakChunk(chunkIndexRef.current)
        } else {
          window.speechSynthesis.resume()
        }
      } else {
        isPausedRef.current = true
        setIsPaused(true)
        window.speechSynthesis.pause()
      }
      return
    }

    isCancelledRef.current = false
    isPausedRef.current = false
    window.speechSynthesis.cancel()
    window.speechSynthesis.resume()

    const chunks = getCleanSpeechChunks(title, content)
    chunksRef.current = chunks
    setTotalChunks(chunks.length)
    if (chunks.length === 0) return

    chunkIndexRef.current = 0
    speakChunk(0)
  }

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      isCancelledRef.current = true
      isPausedRef.current = false
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      chunkIndexRef.current = 0
      setActiveChunk(0)
    }
  }

  const cycleRate = () => {
    const nextRate: Record<number, 1 | 1.25 | 1.5> = { 1: 1.25, 1.25: 1.5, 1.5: 1 }
    const newRate = nextRate[rate]
    setRate(newRate)
    rateRef.current = newRate
    if (isPlaying && !isPaused) {
      window.speechSynthesis.cancel()
      speakChunk(chunkIndexRef.current)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-paper-subtle/80 dark:bg-dark-subtle/80 border border-rule/60 dark:border-dark-rule/60 rounded-full text-xs font-sans select-none backdrop-blur-xs transition">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-ink text-paper dark:bg-dark-ink dark:text-dark-paper hover:opacity-90 active:scale-95 transition cursor-pointer shadow-2xs shrink-0"
          title={isPlaying && !isPaused ? 'Pause narration' : 'Listen to story'}
        >
          {isPlaying && !isPaused ? (
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-ink dark:text-dark-ink text-[11px] sm:text-xs tracking-tight truncate">
            {isPlaying && !isPaused
              ? `Playing (${isHindi ? 'हिन्दी' : 'English'})`
              : isPaused
              ? 'Narration Paused'
              : `Listen to Article (${isHindi ? 'हिन्दी' : 'English'})`}
          </span>

          {isPlaying && !isPaused && (
            <span className="flex items-end gap-0.5 h-3.5 ml-1 shrink-0">
              <span className="w-0.5 bg-accent dark:bg-dark-accent rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-0.5 bg-accent dark:bg-dark-accent rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
              <span className="w-0.5 bg-accent dark:bg-dark-accent rounded-full animate-bounce h-3.5" />
            </span>
          )}

          {isPlaying && totalChunks > 1 && (
            <span className="hidden sm:inline-block text-[10px] text-ink-mute dark:text-dark-mute font-mono ml-1">
              {activeChunk}/{totalChunks}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10.5px] font-mono shrink-0">
        <button
          type="button"
          onClick={cycleRate}
          className="px-2 py-0.5 rounded-full border border-rule dark:border-dark-rule text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-dark-ink hover:border-ink/30 transition cursor-pointer"
          title="Change playback speed"
        >
          {rate}x
        </button>
        {isPlaying && (
          <button
            type="button"
            onClick={handleStop}
            className="px-2 py-0.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            title="Stop audio"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  )
}
