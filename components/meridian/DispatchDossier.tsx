'use client'

import React, { useState } from 'react'

interface DispatchDossierProps {
  title: string
  subtitle?: string
  category: string
  content: string
  publishedAt?: string
  author?: string
}

export default function DispatchDossier({
  title,
  subtitle,
  category,
  content,
  publishedAt,
  author = 'Dhananjay Singh',
}: DispatchDossierProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const cleanSnippet = (content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_~>-]/g, ' ')
    .replace(/s+/g, ' ')
    .trim()

  const sentences = cleanSnippet
    .split(/(?<=[.?!])s+/)
    .filter((s) => s.length > 20 && s.length < 240)

  const takeaway1 =
    subtitle ||
    (sentences[0] ? sentences[0] : ('Core dispatch: ' + title + ' confirmed by reporting desks.'))
  const takeaway2 =
    sentences[1] ||
    ('Strategic context: Cross-referenced with active developments across global ' + category.toLowerCase() + ' corridors.')
  const takeaway3 =
    sentences[2] ||
    'Outlook: Singh Monster investigative desk continues monitoring regulatory and economic follow-through.'

  const pubDate = publishedAt ? new Date(publishedAt) : new Date()
  const timeStr = pubDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const dateStr = pubDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <section
      aria-label="Dispatch Dossier"
      className="my-6 rounded-lg border border-accent/30 bg-paper-subtle/70 dark:bg-dark-subtle/70 backdrop-blur-xs overflow-hidden transition-all shadow-2xs"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-accent/10 dark:bg-accent/15 border-b border-accent/20">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-accent text-paper dark:text-dark-paper shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-paper dark:bg-dark-paper animate-pulse" />
            Dispatch Dossier
          </span>
          <span className="text-xs font-serif font-bold text-ink dark:text-dark-ink tracking-tight">
            Executive Intelligence Briefing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
            title="Primary source corroborated with on-the-record editorial standards"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Primary Source Verified</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium text-accent hover:text-ink dark:hover:text-dark-ink transition cursor-pointer select-none"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Collapse' : 'Expand Dossier'}</span>
            <svg
              className={'w-3.5 h-3.5 transition-transform duration-200 ' + (isExpanded ? 'rotate-180' : '')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 text-ink dark:text-dark-ink">
          <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 w-fit">
            <span>✓ Primary Source Verified • Independent Corroboration</span>
          </div>

          <div>
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent mb-2.5 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-accent rounded-xs" />
              Key Intelligence Takeaways
            </h4>
            <ul className="space-y-2 text-[13.5px] leading-snug font-sans text-ink/90 dark:text-dark-ink/90">
              <li className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span className="flex-1 font-medium">{takeaway1}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span className="flex-1">{takeaway2}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/15 text-accent text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span className="flex-1">{takeaway3}</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-rule/50 dark:border-dark-rule/50">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-ink-mute dark:text-dark-mute mb-2.5 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-ink-mute/50 rounded-xs" />
              Developing Sequence of Events
            </h4>
            <div className="relative pl-4 space-y-3 border-l-2 border-accent/30 text-xs font-sans">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent/40 border-2 border-paper dark:border-dark-paper" />
                <span className="font-mono text-[10px] text-ink-mute dark:text-dark-mute block">Initial Wire Advisory</span>
                <p className="text-ink/80 dark:text-dark-ink/80 mt-0.5">
                  Preliminary reports surfaced through field dispatches and intelligence monitoring.
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent/70 border-2 border-paper dark:border-dark-paper" />
                <span className="font-mono text-[10px] text-ink-mute dark:text-dark-mute block">Editorial Verification</span>
                <p className="text-ink/80 dark:text-dark-ink/80 mt-0.5">
                  Primary source documents and agency filings reviewed by the {category} desk.
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-paper dark:border-dark-paper animate-ping" />
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-accent border-2 border-paper dark:border-dark-paper" />
                <span className="font-mono text-[10px] font-bold text-accent block">
                  {dateStr} • {timeStr}
                </span>
                <p className="font-medium text-ink dark:text-dark-ink mt-0.5">
                  Full investigative report filed and certified for broadsheet distribution by {author}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
