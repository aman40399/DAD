'use client'

import React, { useState, useEffect, useRef } from 'react'
import * as Flags from 'country-flag-icons/react/3x2'
import { AnalyticsStats } from '@/lib/analytics'

interface ChartPoint {
  x: number
  viewY: number
  uniqueY: number
  views: number
  uniques: number
  label: string
  date: string
}

// Cubic Bezier spline interpolation (Catmull-Rom to Bezier)
function generateSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`

  let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`

  for (let i = 0; i < pts.length - 1; i++) {
    const current = pts[i]
    const next = pts[i + 1]
    const prev = pts[i - 1] || current
    const nextNext = pts[i + 2] || next

    // Control points
    const cp1x = current.x + (next.x - prev.x) / 6
    const cp1y = current.y + (next.y - prev.y) / 6
    const cp2x = next.x - (nextNext.x - current.x) / 6
    const cp2y = next.y - (nextNext.y - current.y) / 6

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`
  }

  return path
}

function CountryFlag({ code, className = 'w-5 h-3.5' }: { code: string; className?: string }) {
  const c = code.toUpperCase()
  const FlagComp = (Flags as Record<string, React.ComponentType<{ className?: string; title?: string }>>)[c]

  if (FlagComp) {
    return <FlagComp className={`${className} rounded-xs object-cover inline-block`} title={c} />
  }

  // Fallback: plain text code badge
  return (
    <span className="inline-flex items-center justify-center w-5 h-3.5 rounded-xs bg-paper-subtle dark:bg-dark-subtle border border-rule/40 dark:border-dark-rule/40 text-[7px] font-mono font-bold text-ink-mute dark:text-dark-mute shrink-0">
      {c}
    </span>
  )
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d')
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearSuccess, setClearSuccess] = useState(false)

  // Interactive Chart Tooltip State
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/stats?range=${range}&timeRange=${range}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [range])

  const handleClearData = async () => {
    setClearing(true)
    try {
      const res = await fetch('/api/analytics/clear', { method: 'POST' })
      if (res.ok) {
        await loadStats()
        setClearSuccess(true)
        setTimeout(() => {
          setClearSuccess(false)
          setShowClearModal(false)
        }, 1000)
      }
    } catch (err) {
      console.error('Failed to clear analytics:', err)
    } finally {
      setClearing(false)
    }
  }

  // Trend pill strictly calculated from real telemetry deltas
  const renderTrendPill = (
    trendObj?: { value: number; formatted?: string; isPositive?: boolean }
  ) => {
    if (!trendObj || typeof trendObj.value !== 'number' || isNaN(trendObj.value)) {
      return (
        <span className="inline-flex items-center text-[10px] font-mono text-ink-mute dark:text-dark-mute">
          —
        </span>
      )
    }

    const delta = trendObj.value
    const isNeutral = delta === 0
    const isPositive = delta > 0
    const absVal = Math.abs(delta).toFixed(1)
    const displayVal = isNeutral ? '0.0%' : `${isPositive ? '+' : '-'}${absVal}%`

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
          isNeutral
            ? 'text-ink-mute dark:text-dark-mute bg-ink/5 dark:bg-white/5 border-rule/50 dark:border-white/10'
            : isPositive
            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
            : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
        }`}
      >
        {!isNeutral && <span>{isPositive ? '↑' : '↓'}</span>}
        <span>{displayVal}</span>
      </span>
    )
  }

  // SVG Chart
  const renderInteractiveChart = () => {
    const data = stats?.timeSeries || stats?.viewsOverTime || []
    if (!stats || data.length === 0) {
      return (
        <div className="h-40 sm:h-56 flex flex-col items-center justify-center text-xs font-mono text-ink-mute space-y-2 border border-dashed border-rule dark:border-dark-rule rounded-xs">
          <span>No data recorded for this timeframe.</span>
          <span className="text-[10px] opacity-75">Reader impressions will appear here.</span>
        </div>
      )
    }

    const maxVal = Math.max(...data.map((d) => Math.max(d.views, d.uniques || 0)), 10)
    const height = 180
    const width = 760
    const padding = { top: 20, right: 24, bottom: 32, left: 44 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    const points: ChartPoint[] = data.map((d, idx) => {
      const x = padding.left + (idx / Math.max(data.length - 1, 1)) * chartW
      const viewY = padding.top + chartH - (d.views / maxVal) * chartH
      const uniquesCount = d.uniques || 0
      const uniqueY = padding.top + chartH - (uniquesCount / maxVal) * chartH
      return {
        x,
        viewY,
        uniqueY,
        views: d.views,
        uniques: uniquesCount,
        label: d.label,
        date: d.date || d.label,
      }
    })

    const viewPts = points.map((p) => ({ x: p.x, y: p.viewY }))
    const uniquePts = points.map((p) => ({ x: p.x, y: p.uniqueY }))

    const viewsPath = generateSmoothPath(viewPts)
    const uniquesPath = generateSmoothPath(uniquePts)

    const areaPath = `${viewsPath} L ${points[points.length - 1].x.toFixed(1)},${(padding.top + chartH).toFixed(1)} L ${points[0].x.toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`

    const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const clientX = e.clientX - rect.left
      const clientY = e.clientY - rect.top
      const svgX = (clientX / rect.width) * width

      let closest = points[0]
      let minDiff = Infinity
      for (const pt of points) {
        const diff = Math.abs(pt.x - svgX)
        if (diff < minDiff) {
          minDiff = diff
          closest = pt
        }
      }

      setHoveredPoint(closest)
      setMousePos({ x: clientX, y: clientY })
    }

    const handlePointerLeave = () => {
      setHoveredPoint(null)
      setMousePos(null)
    }

    return (
      <div ref={chartContainerRef} className="relative w-full select-none">
        {/* Tooltip */}
        {hoveredPoint && mousePos && chartContainerRef.current && (
          <div
            className="absolute z-30 pointer-events-none bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule p-2.5 shadow-lg rounded-xs text-xs font-sans space-y-1 transition-opacity duration-150"
            style={{
              left: Math.min(
                Math.max(mousePos.x - 60, 8),
                chartContainerRef.current.clientWidth - 160
              ),
              top: Math.max(mousePos.y - 75, 8),
            }}
          >
            <div className="font-mono text-[9px] text-ink-mute uppercase tracking-wider pb-1 border-b border-rule/50 dark:border-dark-rule/50">
              {hoveredPoint.label}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1 text-accent font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Views
              </span>
              <strong className="font-mono text-ink dark:text-dark-ink">
                {hoveredPoint.views.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Uniques
              </span>
              <strong className="font-mono text-ink dark:text-dark-ink">
                {hoveredPoint.uniques.toLocaleString()}
              </strong>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40 sm:h-52 overflow-visible cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <linearGradient id="meridianAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0071e3" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#0071e3" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0071e3" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartH * (1 - pct)
            const val = Math.round(maxVal * pct)
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  className="text-black/[0.06] dark:text-white/[0.06]"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-ink-mute dark:fill-dark-mute"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            )
          })}

          <path d={areaPath} fill="url(#meridianAreaGradient)" />

          <path
            d={viewsPath}
            fill="none"
            stroke="#0071e3"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={uniquesPath}
            fill="none"
            stroke="#34c759"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover crosshair */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={padding.top + chartH}
                stroke="#0071e3"
                strokeWidth="1"
                strokeDasharray="3 3"
                className="opacity-70"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.viewY}
                r="5"
                className="fill-white dark:fill-[#1c1c1e] stroke-[#0071e3] stroke-2"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.uniqueY}
                r="4"
                className="fill-white dark:fill-[#1c1c1e] stroke-[#34c759] stroke-2"
              />
            </g>
          )}

          {/* Static point markers */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.viewY}
              r="3"
              className="fill-white dark:fill-[#1c1c1e] stroke-[#0071e3] stroke-1.5 transition-all duration-150"
            />
          ))}

          {/* X Axis Date Labels */}
          {points
            .filter(
              (_, idx) =>
                idx % Math.ceil(points.length / 7) === 0 || idx === points.length - 1
            )
            .map((pt, i) => (
              <text
                key={i}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[9px] font-mono fill-ink-mute dark:fill-dark-mute uppercase"
              >
                {pt.label}
              </text>
            ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 sm:gap-6 pt-1.5 font-mono text-[10px] text-ink-mute dark:text-dark-mute">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-accent inline-block" />
            <span className="font-semibold text-ink dark:text-dark-ink">Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
            <span className="font-semibold text-ink dark:text-dark-ink">Uniques</span>
          </div>
        </div>
      </div>
    )
  }

  // Device breakdown mini bars
  const renderDeviceBreakdown = () => {
    if (!stats?.deviceBreakdown) return null
    const { desktop, mobile, tablet } = stats.deviceBreakdown
    const total = desktop + mobile + tablet
    if (total === 0) return null

    const items = [
      { label: 'Desktop', value: desktop, pct: Math.round((desktop / total) * 100) },
      { label: 'Mobile', value: mobile, pct: Math.round((mobile / total) * 100) },
      { label: 'Tablet', value: tablet, pct: Math.round((tablet / total) * 100) },
    ].filter((d) => d.value > 0)

    return (
      <div className="space-y-2.5">
        {items.map((d) => (
          <div key={d.label} className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-mute dark:text-dark-mute font-mono text-[11px]">{d.label}</span>
              <span className="font-mono text-[11px] text-ink-mute dark:text-dark-mute">
                <strong className="text-ink dark:text-dark-ink">{d.value.toLocaleString()}</strong> ({d.pct}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-paper-subtle dark:bg-white/[0.05] border border-rule/50 dark:border-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(d.pct, 3)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 font-apple">
      {/* APPLE MINIMALIST TOP ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
            Analytics
          </h1>

          {/* Unified Status Capsule Box */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-xl bg-white/70 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium shadow-2xs">
            <span className="text-[#0071e3] dark:text-[#2997ff] font-semibold">
              {(stats?.totalViews || 0).toLocaleString()} Views
            </span>
            <span className="text-black/20 dark:text-white/20">•</span>
            <span className="text-[#1d1d1f]/60 dark:text-white/60">
              {(stats?.uniqueVisitors || 0).toLocaleString()} Uniques
            </span>
          </div>
        </div>

        {/* Range Filter & Clear Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Range Filter Pills: Apple segmented track */}
          <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.05] rounded-full">
            {[
              { id: 'today', label: '1D' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: 'all', label: 'All' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRange(item.id as any)}
                className={`h-7 px-3 sm:px-3.5 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer text-center active:scale-95 ${
                  range === item.id
                    ? 'bg-white dark:bg-[#2c2c2e] text-[#0071e3] dark:text-[#2997ff] shadow-2xs'
                    : 'text-[#1d1d1f]/60 dark:text-white/60 hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Purge / Clear Telemetry Button */}
          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            className="h-9 px-3.5 text-xs font-semibold text-[#1d1d1f]/70 dark:text-white/70 hover:text-red-600 dark:hover:text-red-400 bg-white/70 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] hover:border-red-200 dark:hover:border-red-900/40 rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
            title="Reset telemetry database"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards — Sleek 2x2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Views */}
        <div className="p-4 sm:p-5 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-mute dark:text-dark-mute font-bold">
              Views
            </span>
            {renderTrendPill(stats?.trends?.views)}
          </div>
          <div className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink tracking-tight">
            {loading ? '…' : (stats?.totalViews.toLocaleString() || '0')}
          </div>
          <p className="hidden sm:block text-[10px] text-ink-mute dark:text-dark-mute font-serif italic">
            Total page dispatches
          </p>
        </div>

        {/* Card 2: Uniques */}
        <div className="p-4 sm:p-5 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-mute dark:text-dark-mute font-bold">
              Uniques
            </span>
            {renderTrendPill(stats?.trends?.uniques)}
          </div>
          <div className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink tracking-tight">
            {loading ? '…' : (stats?.uniqueVisitors.toLocaleString() || '0')}
          </div>
          <p className="hidden sm:block text-[10px] text-ink-mute dark:text-dark-mute font-serif italic">
            Unique reader sessions
          </p>
        </div>

        {/* Card 3: Avg Time */}
        <div className="p-4 sm:p-5 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-mute dark:text-dark-mute font-bold">
              Avg Time
            </span>
            {renderTrendPill(stats?.trends?.readingTime)}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif font-black text-2xl sm:text-3xl text-[#0071e3] tracking-tight">
              {loading ? '…' : `${stats?.avgReadingTimeMinutes ?? stats?.avgReadingTime ?? 0}m`}
            </span>
            <span className="text-[10px] font-mono text-ink-mute dark:text-dark-mute">/ dispatch</span>
          </div>
          <p className="hidden sm:block text-[10px] text-ink-mute dark:text-dark-mute font-serif italic">
            Average attention depth
          </p>
        </div>

        {/* Card 4: Published */}
        <div className="p-4 sm:p-5 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-mute dark:text-dark-mute font-bold">
              Published
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#0071e3]/30 bg-[#0071e3]/10 text-[#0071e3]">
              {stats?.pinnedSlotsCount || 0} pinned
            </span>
          </div>
          <div className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink tracking-tight">
            {loading ? '…' : (stats?.publishedArticlesCount || stats?.activeArticles || 0)}
          </div>
          <p className="hidden sm:block text-[10px] text-ink-mute dark:text-dark-mute font-serif italic">
            Stories in circulation
          </p>
        </div>
      </div>

      {/* Main Analytics Grid: Time-series Chart & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (7 cols): Readership Velocity Catmull-Rom Spline */}
        <div className="lg:col-span-7 p-5 sm:p-6 backdrop-blur-xl bg-white/70 dark:bg-[#1c1c1e]/75 border border-black/[0.06] dark:border-white/[0.08] rounded-3xl space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.05] dark:border-white/[0.08]">
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-dark-ink tracking-tight">
                Readership Velocity
              </h3>
              <p className="text-[11px] text-ink-mute dark:text-dark-mute font-mono">
                Catmull-Rom Spline ({range.toUpperCase()})
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                Live Feed
              </span>
            </div>
          </div>

          {loading ? (
            <div className="h-40 sm:h-52 flex items-center justify-center text-xs font-mono text-ink-mute">
              Loading telemetry curves…
            </div>
          ) : (
            renderInteractiveChart()
          )}
        </div>

        {/* Right Column (5 cols): Regional Reach with SVG Country Flags */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-paper dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-rule/60 dark:border-white/[0.08]">
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-dark-ink">
                Regional Reach
              </h3>
              <p className="text-[11px] text-ink-mute dark:text-dark-mute font-mono">
                Edge Ingest Telemetry
              </p>
            </div>
            <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider px-2 py-0.5 bg-accent/10 border border-accent/30 rounded-full">
              Global
            </span>
          </div>

          <div className="space-y-3 pt-0.5">
            {loading ? (
              <div className="py-8 text-center text-xs font-mono text-ink-mute">
                Aggregating regional data…
              </div>
            ) : (stats?.topCountries || stats?.regionalBreakdown || []).length === 0 ? (
              <p className="text-xs text-ink-mute italic py-4 text-center">No regional telemetry recorded.</p>
            ) : (
              (stats?.topCountries || stats?.regionalBreakdown || []).map((c) => (
                <div key={c.code} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2.5 font-semibold text-ink dark:text-dark-ink min-w-0">
                      <CountryFlag code={c.code} className="w-5 h-3.5 rounded-xs shadow-2xs shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="font-mono text-xs text-ink-mute dark:text-dark-mute shrink-0 ml-2">
                      <strong className="text-ink dark:text-dark-ink">{c.views.toLocaleString()}</strong> reads ({c.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-paper-subtle dark:bg-white/[0.05] border border-rule/50 dark:border-white/5 overflow-hidden rounded-full">
                    <div
                      className="h-full bg-accent transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(c.percentage, 3)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Top Articles, Traffic Acquisition, Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Articles */}
        <div className="p-4 sm:p-5 bg-paper dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 rounded-2xl space-y-2.5 shadow-xs">
          <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-dark-ink pb-2 border-b border-rule/60 dark:border-white/[0.08]">
            Top Articles
          </h3>
          <div className="divide-y divide-rule/50 dark:divide-white/[0.06]">
            {(stats?.topArticles || []).map((art, idx) => {
              const cleanTitle = art.title.replace(/\s*\|\s*Singh Monster.*$/i, '').trim()
              return (
                <div key={art.slug} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-mono text-[10px] font-bold text-accent w-4 shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={`/article/${art.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block font-serif font-bold text-ink dark:text-dark-ink hover:text-accent truncate"
                        title={cleanTitle}
                      >
                        {cleanTitle}
                      </a>
                      {art.category && (
                        <span className="text-[9px] font-mono uppercase tracking-wider text-ink-mute dark:text-dark-mute">
                          {art.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-ink-mute shrink-0 ml-1">
                    {art.views.toLocaleString()} reads
                  </span>
                </div>
              )
            })}
            {(!stats?.topArticles || stats.topArticles.length === 0) && !loading && (
              <p className="text-xs text-ink-mute italic py-4 text-center">No article data yet.</p>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="p-4 sm:p-5 bg-paper dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 rounded-2xl space-y-2.5 shadow-xs">
          <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-dark-ink pb-2 border-b border-rule/60 dark:border-white/[0.08]">
            Traffic Sources
          </h3>
          <div className="divide-y divide-rule/50 dark:divide-white/[0.06]">
            {(stats?.topReferrers || stats?.referrerBreakdown || []).map((ref) => (
              <div key={ref.source} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <span className="font-sans text-ink dark:text-dark-ink truncate min-w-0 flex-1" title={ref.source}>
                  {ref.source}
                </span>
                <span className="font-mono text-[11px] text-ink-mute shrink-0 ml-1">
                  {ref.count} ({ref.percentage}%)
                </span>
              </div>
            ))}
            {(!stats?.topReferrers || stats.topReferrers.length === 0) && !loading && (
              <p className="text-xs text-ink-mute italic py-4 text-center">No referrer data yet.</p>
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="p-4 sm:p-5 bg-paper dark:bg-white/[0.03] border border-rule/60 dark:border-white/10 rounded-2xl space-y-2.5 shadow-xs">
          <h3 className="font-serif font-bold text-sm sm:text-base text-ink dark:text-dark-ink pb-2 border-b border-rule/60 dark:border-white/[0.08]">
            Devices
          </h3>
          {loading ? (
            <div className="py-6 text-center text-xs font-mono text-ink-mute">Loading device data…</div>
          ) : (
            renderDeviceBreakdown() || (
              <p className="text-xs text-ink-mute italic py-4 text-center">No device data yet.</p>
            )
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing Visitor Telemetry */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-paper dark:bg-[#141416] border border-rule/70 dark:border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rule/60 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h3 className="font-serif font-bold text-lg text-ink dark:text-white">
                  Purge Telemetry Data
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-mute hover:text-ink dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-sans text-ink-mute dark:text-dark-mute leading-relaxed">
              This will permanently delete all stored reader impressions, country analytics, device metrics, and session records from the production database. Real live reader traffic will continue to populate automatically.
            </p>

            {clearSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                All visitor telemetry wiped successfully.
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={clearing}
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-ink-mute hover:text-ink dark:text-dark-mute dark:hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={clearing}
                  onClick={handleClearData}
                  className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {clearing ? 'Purging…' : 'Confirm Wipe'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
