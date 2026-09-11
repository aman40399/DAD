'use client'

import { useState, useEffect, useRef } from 'react'

interface ArticleAudioPlayerProps {
  title: string
  content: string
}

export default function ArticleAudioPlayer({ title, content }: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [supported, setSupported] = useState(false)
  const [rate, setRate] = useState<1 | 1.25 | 1.5>(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true)

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
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  if (!supported) return null

  const getCleanText = () => {
    // Strip HTML and markdown syntax to prepare clean speech text
    const cleanBody = (content || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return `${title}. ${cleanBody}`
  }

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) return

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume()
        setIsPaused(false)
      } else {
        window.speechSynthesis.pause()
        setIsPaused(true)
      }
      return
    }

    window.speechSynthesis.cancel()

    const textToSpeak = getCleanText()
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = rate

    // Detect if text is Devanagari / Hindi to select appropriate speech voice if available
    const isHindi = /[\u0900-\u097F]/.test(textToSpeak)
    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices()
    if (isHindi) {
      const hiVoice = availableVoices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN'))
      if (hiVoice) utterance.voice = hiVoice
    } else {
      const enVoice = availableVoices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang.includes('US') || v.lang.includes('GB')))
      if (enVoice) utterance.voice = enVoice
    }

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  const cycleRate = () => {
    const nextRate: Record<number, 1 | 1.25 | 1.5> = { 1: 1.25, 1.25: 1.5, 1.5: 1 }
    const newRate = nextRate[rate]
    setRate(newRate)
    if (isPlaying) {
      handleStop()
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-paper-subtle/80 dark:bg-dark-subtle/80 border border-rule/60 dark:border-dark-rule/60 rounded-full text-xs font-sans select-none backdrop-blur-xs transition">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handlePlayPause}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-ink text-paper dark:bg-dark-ink dark:text-dark-paper hover:opacity-90 active:scale-95 transition cursor-pointer shadow-2xs"
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

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-ink dark:text-dark-ink text-[11px] sm:text-xs tracking-tight">
            {isPlaying && !isPaused ? 'Playing Narration' : isPaused ? 'Narration Paused' : 'Listen to Article'}
          </span>
          {isPlaying && !isPaused && (
            <span className="flex items-end gap-0.5 h-3.5 ml-1">
              <span className="w-0.5 bg-accent dark:bg-dark-accent rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-0.5 bg-accent dark:bg-dark-accent rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
              <span className="w-0.5 bg-accent dark:bg-dark-accent rounded-full animate-bounce h-3.5" />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10.5px] font-mono">
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
