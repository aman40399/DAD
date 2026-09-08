import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { queryD1, executeD1, isD1Configured } from '@/lib/d1'
import type {
  AnalyticsEvent,
  AnalyticsStats,
  CountryStat,
  ArticleStat,
  ReferrerStat,
  DeviceBreakdown,
  TimeSeriesPoint,
  TimeRangeFilter,
  MetricTrend,
  PeriodComparison,
  GeoLocationData,
  CollectTelemetryInput,
  AnalyticsSummary,
} from '@/types'

// Re-export types for direct library consumers and existing components
export type {
  AnalyticsEvent,
  AnalyticsStats,
  CountryStat,
  ArticleStat,
  ReferrerStat,
  DeviceBreakdown,
  TimeSeriesPoint,
  TimeRangeFilter,
  MetricTrend,
  PeriodComparison,
  GeoLocationData,
  CollectTelemetryInput,
  AnalyticsSummary,
}

// ---------------------------------------------------------------------------
// Canonical Global Taxonomy & Country Code Mapping
// ---------------------------------------------------------------------------

export const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  IN: 'India',
  DE: 'Germany',
  FR: 'France',
  CA: 'Canada',
  JP: 'Japan',
  AU: 'Australia',
  SG: 'Singapore',
  NL: 'Netherlands',
  CH: 'Switzerland',
  BR: 'Brazil',
  IT: 'Italy',
  ES: 'Spain',
  KR: 'South Korea',
  AE: 'United Arab Emirates',
  SE: 'Sweden',
  CN: 'China',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  MX: 'Mexico',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  IE: 'Ireland',
  PL: 'Poland',
  AT: 'Austria',
  BE: 'Belgium',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PT: 'Portugal',
  GR: 'Greece',
  TR: 'Turkey',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  EG: 'Egypt',
  SA: 'Saudi Arabia',
  IL: 'Israel',
  TH: 'Thailand',
  ID: 'Indonesia',
  MY: 'Malaysia',
  PH: 'Philippines',
  VN: 'Vietnam',
  RU: 'Russia',
  INTL: 'International Dispatch',
}

export const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  // Asia
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Tokyo': 'JP',
  'Asia/Singapore': 'SG',
  'Asia/Seoul': 'KR',
  'Asia/Dubai': 'AE',
  'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW',
  'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Manila': 'PH',
  'Asia/Riyadh': 'SA',
  'Asia/Jerusalem': 'IL',
  'Asia/Ho_Chi_Minh': 'VN',

  // Europe
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Frankfurt': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Amsterdam': 'NL',
  'Europe/Zurich': 'CH',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Stockholm': 'SE',
  'Europe/Dublin': 'IE',
  'Europe/Warsaw': 'PL',
  'Europe/Vienna': 'AT',
  'Europe/Brussels': 'BE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Lisbon': 'PT',
  'Europe/Athens': 'GR',
  'Europe/Istanbul': 'TR',
  'Europe/Moscow': 'RU',

  // Americas
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Los_Angeles': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Detroit': 'US',
  'America/Anchorage': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Sao_Paulo': 'BR',
  'America/Mexico_City': 'MX',
  'America/Buenos_Aires': 'AR',
  'America/Santiago': 'CL',
  'America/Bogota': 'CO',

  // Oceania & Africa
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',
  'Africa/Johannesburg': 'ZA',
  'Africa/Cairo': 'EG',
}

// ---------------------------------------------------------------------------
// 1. Cryptographic Privacy-Preserving Session Hash (Zero PII Engine)
// ---------------------------------------------------------------------------

export function generatePrivacySessionId(
  ip: string,
  userAgent: string,
  clientHint?: string
): string {
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  const secret = process.env.ANALYTICS_SALT_SECRET || 'meridian-broadsheet-salt-key-2026'
  const dailySalt = crypto
    .createHash('sha256')
    .update(`${secret}:${today}`)
    .digest('hex')
    .slice(0, 16)

  const hash = crypto
    .createHash('sha256')
    .update(`${ip}::${userAgent}::${dailySalt}::${clientHint || ''}`)
    .digest('hex')
    .slice(0, 16)

  return `sess_${hash}`
}

// ---------------------------------------------------------------------------
// 2. Robust 5-Stage Edge Geo Fallback Chain
// ---------------------------------------------------------------------------

export function detectCountryCode(
  headers: Headers | Record<string, string | null | undefined>,
  clientPayload?: { country?: string; timezone?: string; locale?: string }
): { code: string; name: string } {
  const getHeader = (key: string): string => {
    if (!headers) return ''
    if ('get' in headers && typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(key) || ''
    }
    return (headers as Record<string, string | null | undefined>)[key] || ''
  }

  // Stage 1: Edge CDN Headers (Filtering Cloudflare unknown 'XX' and Tor 'T1')
  const cfCountry = getHeader('cf-ipcountry').toUpperCase().trim()
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX' && cfCountry !== 'T1') {
    return { code: cfCountry, name: COUNTRY_NAMES[cfCountry] || cfCountry }
  }

  const vercelCountry = getHeader('x-vercel-ip-country').toUpperCase().trim()
  if (vercelCountry && vercelCountry.length === 2 && vercelCountry !== 'XX') {
    return { code: vercelCountry, name: COUNTRY_NAMES[vercelCountry] || vercelCountry }
  }

  const cloudfrontCountry = getHeader('cloudfront-viewer-country').toUpperCase().trim()
  if (cloudfrontCountry && cloudfrontCountry.length === 2 && cloudfrontCountry !== 'XX') {
    return { code: cloudfrontCountry, name: COUNTRY_NAMES[cloudfrontCountry] || cloudfrontCountry }
  }

  const genericCountry = getHeader('x-country-code').toUpperCase().trim()
  if (genericCountry && genericCountry.length === 2 && genericCountry !== 'XX') {
    return { code: genericCountry, name: COUNTRY_NAMES[genericCountry] || genericCountry }
  }

  // Stage 2: Client Payload Explicit Country
  if (
    clientPayload?.country &&
    clientPayload.country.length === 2 &&
    clientPayload.country.toUpperCase() !== 'XX'
  ) {
    const code = clientPayload.country.toUpperCase()
    return { code, name: COUNTRY_NAMES[code] || code }
  }

  // Stage 3: Client Timezone Mapping Fallback (60+ IANA Metropolitan Zones)
  const tz = clientPayload?.timezone || getHeader('x-timezone')
  if (tz && TIMEZONE_COUNTRY_MAP[tz]) {
    const code = TIMEZONE_COUNTRY_MAP[tz]
    return { code, name: COUNTRY_NAMES[code] || code }
  }
  if (tz) {
    if (tz.startsWith('America/')) return { code: 'US', name: COUNTRY_NAMES.US }
    if (tz.startsWith('Europe/')) return { code: 'GB', name: COUNTRY_NAMES.GB }
    if (tz.startsWith('Asia/')) return { code: 'IN', name: COUNTRY_NAMES.IN }
    if (tz.startsWith('Australia/')) return { code: 'AU', name: COUNTRY_NAMES.AU }
    if (tz.startsWith('Africa/')) return { code: 'ZA', name: COUNTRY_NAMES.ZA }
    if (tz.startsWith('Pacific/')) return { code: 'NZ', name: COUNTRY_NAMES.NZ }
  }

  // Stage 4: Accept-Language / Client Locale Fallback
  const rawLocale = clientPayload?.locale || getHeader('accept-language')
  if (rawLocale) {
    const match = rawLocale.match(/[a-z]{2,3}[-_]([A-Z]{2})/i)
    if (match && match[1]) {
      const code = match[1].toUpperCase()
      if (COUNTRY_NAMES[code]) {
        return { code, name: COUNTRY_NAMES[code] }
      }
    }
  }

  // Stage 5: Default Fallback
  return { code: 'US', name: COUNTRY_NAMES.US }
}

// ---------------------------------------------------------------------------
// 3. Device Modality Classification
// ---------------------------------------------------------------------------

export function classifyDevice(
  userAgent?: string,
  hint?: 'desktop' | 'mobile' | 'tablet'
): 'desktop' | 'mobile' | 'tablet' {
  if (hint && ['desktop', 'mobile', 'tablet'].includes(hint)) return hint
  const ua = (userAgent || '').toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/(mobile|iphone|ipod|blackberry|opera mini|opera mobi|windows phone|iemobile|wpdesktop)/i.test(ua)) return 'mobile'
  return 'desktop'
}

// ---------------------------------------------------------------------------
// 4. Acquisition Channel / Referrer Normalizer
// ---------------------------------------------------------------------------

export function classifyReferrer(rawReferrer?: string, host?: string): string {
  if (!rawReferrer) return 'Direct / Broadsheet Bookmark'
  try {
    const url = new URL(rawReferrer)
    if (host && url.host === host) return 'Direct / Broadsheet Navigation'
    const h = url.hostname.toLowerCase()
    if (h.includes('google')) return 'Google News / Search'
    if (h.includes('twitter') || h.includes('x.com') || h === 't.co') return '𝕏 / Twitter Dispatches'
    if (h.includes('linkedin') || h === 'lnkd.in') return 'LinkedIn Professional Rail'
    if (h.includes('substack')) return 'Substack / Editorial Syndicate'
    if (h.includes('facebook') || h.includes('fb.com')) return 'Facebook'
    if (h.includes('reddit') || h.includes('redd.it')) return 'Reddit Discussions'
    if (h.includes('bing') || h.includes('duckduckgo') || h.includes('yahoo')) return 'Search Desks'
    return h.replace(/^www\./, '').slice(0, 30)
  } catch {
    return rawReferrer.slice(0, 30)
  }
}

// ---------------------------------------------------------------------------
// 5. Resilient Local File Store, Debounced Queue & Atomic Disk Flushing
// ---------------------------------------------------------------------------

function getDataDirectory(): string {
  const dir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // Ignored if read-only filesystem
    }
  }
  return dir
}

function getAnalyticsFilePath(): string {
  return path.join(getDataDirectory(), 'analytics.json')
}

// Global process-level memory store & state
declare global {
  var __meridian_analytics_store__: AnalyticsEvent[] | undefined
  var __meridian_analytics_dirty__: boolean | undefined
  var __meridian_analytics_unwritten_count__: number | undefined
  var __meridian_analytics_flush_timer__: NodeJS.Timeout | undefined
  var __meridian_analytics_is_flushing__: boolean | undefined
  var __meridian_analytics_pending_flush__: boolean | undefined
  var __meridian_analytics_hooks_registered__: boolean | undefined
}

function writeToDiskAtomic(events: AnalyticsEvent[]): void {
  const dir = getDataDirectory()
  const filePath = getAnalyticsFilePath()
  // Cap in-memory/file storage to last 15,000 events to prevent unbounded growth
  const trimmed = events.slice(-15000)
  const tempPath = path.join(
    dir,
    `.analytics.json.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`
  )

  try {
    fs.writeFileSync(tempPath, JSON.stringify(trimmed, null, 2), 'utf-8')
    fs.renameSync(tempPath, filePath)
    globalThis.__meridian_analytics_dirty__ = false
    globalThis.__meridian_analytics_unwritten_count__ = 0
  } catch (err) {
    console.warn('⚠️ Non-fatal: Error persisting analytics to disk:', err)
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath)
      }
    } catch {
      // Temp cleanup error ignored
    }
  }
}

const DEBOUNCE_MS = 1000
const MAX_UNWRITTEN_THRESHOLD = 25

function flushToDiskSync(): void {
  if (!globalThis.__meridian_analytics_dirty__) return
  const store = globalThis.__meridian_analytics_store__
  if (store && store.length > 0) {
    writeToDiskAtomic(store)
  }
}

function executeFlushQueue(): void {
  if (globalThis.__meridian_analytics_flush_timer__) {
    clearTimeout(globalThis.__meridian_analytics_flush_timer__)
    globalThis.__meridian_analytics_flush_timer__ = undefined
  }

  if (!globalThis.__meridian_analytics_dirty__) return

  if (globalThis.__meridian_analytics_is_flushing__) {
    globalThis.__meridian_analytics_pending_flush__ = true
    return
  }

  globalThis.__meridian_analytics_is_flushing__ = true
  try {
    const store = globalThis.__meridian_analytics_store__
    if (store) {
      writeToDiskAtomic(store)
    }
  } finally {
    globalThis.__meridian_analytics_is_flushing__ = false
    if (globalThis.__meridian_analytics_pending_flush__) {
      globalThis.__meridian_analytics_pending_flush__ = false
      executeFlushQueue()
    }
  }
}

function scheduleDiskFlush(): void {
  globalThis.__meridian_analytics_dirty__ = true
  globalThis.__meridian_analytics_unwritten_count__ =
    (globalThis.__meridian_analytics_unwritten_count__ || 0) + 1

  if ((globalThis.__meridian_analytics_unwritten_count__ || 0) >= MAX_UNWRITTEN_THRESHOLD) {
    executeFlushQueue()
    return
  }

  if (!globalThis.__meridian_analytics_flush_timer__) {
    const timer = setTimeout(() => {
      globalThis.__meridian_analytics_flush_timer__ = undefined
      executeFlushQueue()
    }, DEBOUNCE_MS)

    if (typeof timer.unref === 'function') {
      timer.unref()
    }
    globalThis.__meridian_analytics_flush_timer__ = timer
  }
}

function registerProcessExitHooks(): void {
  if (globalThis.__meridian_analytics_hooks_registered__) return
  if (typeof process === 'undefined' || typeof process.on !== 'function') return

  globalThis.__meridian_analytics_hooks_registered__ = true

  const handleExit = () => {
    try {
      flushToDiskSync()
    } catch {
      // Non-fatal exit flush
    }
  }

  process.on('beforeExit', handleExit)
  process.on('SIGINT', () => {
    handleExit()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    handleExit()
    process.exit(0)
  })
}

// ---------------------------------------------------------------------------
// 6. Persistent Telemetry Store (Real Data Only - Zero Dummy Seeds)
// ---------------------------------------------------------------------------

function loadAnalytics(): AnalyticsEvent[] {
  registerProcessExitHooks()
  const filePath = getAnalyticsFilePath()

  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      if (data.trim().length > 0) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not parse analytics.json, initializing real store:', err)
    }
  }

  // Pure real-world tracking: start fresh with zero mock records
  writeToDiskAtomic([])
  return []
}


declare global {
  var __meridian_analytics_mtime__: number | undefined
}

export function getStore(): AnalyticsEvent[] {
  const filePath = getAnalyticsFilePath()
  let currentMtime = 0
  if (fs.existsSync(filePath)) {
    try {
      currentMtime = fs.statSync(filePath).mtimeMs
    } catch {}
  }

  if (
    !globalThis.__meridian_analytics_store__ ||
    (currentMtime > 0 && currentMtime !== globalThis.__meridian_analytics_mtime__)
  ) {
    globalThis.__meridian_analytics_store__ = loadAnalytics()
    globalThis.__meridian_analytics_mtime__ = currentMtime
  }
  return globalThis.__meridian_analytics_store__
}


// ---------------------------------------------------------------------------
// 7. Public Telemetry Ingest API
// ---------------------------------------------------------------------------

export async function clearAnalyticsData(): Promise<void> {
  if (isD1Configured()) {
    try {
      await executeD1('DELETE FROM visitor_analytics')
    } catch (err) {
      console.error('Error clearing D1 visitor_analytics:', err)
    }
  }
  globalThis.__meridian_analytics_store__ = []
  writeToDiskAtomic([])
}

export async function recordAnalyticsEvent(event: Partial<AnalyticsEvent>): Promise<void> {
  const store = getStore()
  const countryCode = event.country ? event.country.toUpperCase().slice(0, 2) : 'US'
  const countryName = event.countryName || COUNTRY_NAMES[countryCode] || countryCode

  const fullEvent: AnalyticsEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    path: event.path || '/',
    slug: event.slug,
    title: event.title,
    country: countryCode,
    countryName,
    referrer: event.referrer || 'Direct / Broadsheet Bookmark',
    device: event.device || 'desktop',
    sessionId: event.sessionId || `sess_${Math.random().toString(36).substring(2, 10)}`,
    durationSeconds:
      typeof event.durationSeconds === 'number' && event.durationSeconds > 0
        ? Math.min(1800, Math.round(event.durationSeconds))
        : undefined,
    timestamp: new Date().toISOString(),
  }

  // 1. Write to Cloudflare D1 for durable cross-serverless persistence
  if (isD1Configured()) {
    try {
      await executeD1(
        `INSERT INTO visitor_analytics (id, visitor_id, session_id, page_path, country, region, city, device_type, browser, os, timestamp, title, referrer, duration_seconds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullEvent.id,
          fullEvent.sessionId,
          fullEvent.sessionId,
          fullEvent.path,
          fullEvent.country,
          fullEvent.countryName || '',
          '',
          fullEvent.device,
          '',
          '',
          fullEvent.timestamp,
          fullEvent.title || '',
          fullEvent.referrer || 'Direct / Broadsheet Bookmark',
          fullEvent.durationSeconds || 0,
        ]
      )
    } catch (err) {
      console.error('Non-fatal: failed to persist analytics event to D1:', err)
    }
  }

  // 2. Keep in-memory / local file
  store.push(fullEvent)
  scheduleDiskFlush()
}

// ---------------------------------------------------------------------------
// 8. Trend Calculation Utility
// ---------------------------------------------------------------------------

export function calculateTrend(curr: number, prior: number): MetricTrend {
  if (prior === 0) {
    const val = curr > 0 ? 100 : 0
    return {
      value: val,
      formatted: val > 0 ? '↑ +100%' : '— 0.0%',
      isPositive: true,
      current: curr,
      previous: prior,
      changePercentage: val,
    }
  }
  const delta = ((curr - prior) / prior) * 100
  const rounded = Number(delta.toFixed(1))
  const formatted =
    delta > 0
      ? `↑ +${rounded.toFixed(1)}%`
      : delta < 0
      ? `↓ ${rounded.toFixed(1)}%`
      : '— 0.0%'
  return {
    value: rounded,
    formatted,
    isPositive: delta >= 0,
    current: curr,
    previous: prior,
    changePercentage: rounded,
  }
}

// ---------------------------------------------------------------------------
// 9. Public Analytics Query & Aggregation Engine
// ---------------------------------------------------------------------------

export async function getAnalyticsStats(
  timeRange: TimeRangeFilter = '7d'
): Promise<AnalyticsStats> {
  let allEvents: AnalyticsEvent[] = []

  if (isD1Configured()) {
    try {
      const rows = await queryD1<{
        id: string
        session_id: string
        page_path: string
        country: string
        region: string
        device_type: string
        timestamp: string
        title: string
        referrer: string
        duration_seconds: number
      }>(
        `SELECT id, session_id, page_path, country, region, device_type, timestamp, title, referrer, duration_seconds
         FROM visitor_analytics ORDER BY timestamp DESC LIMIT 20000`
      )

      allEvents = (rows || []).map((r) => ({
        id: r.id,
        path: r.page_path,
        title: r.title,
        country: r.country || 'US',
        countryName: COUNTRY_NAMES[r.country] || r.region || r.country || 'Global Reader',
        referrer: r.referrer || 'Direct / Broadsheet Bookmark',
        device: (r.device_type as any) || 'desktop',
        sessionId: r.session_id,
        durationSeconds: r.duration_seconds || undefined,
        timestamp: r.timestamp,
      }))
    } catch (err) {
      console.error('Error querying D1 for analytics, falling back to local file:', err)
      allEvents = getStore()
    }
  } else {
    allEvents = getStore()
  }
  const now = new Date()

  // Window Cutoffs
  let currentCutoff = new Date(0)
  let priorCutoffStart = new Date(0)
  let priorCutoffEnd = new Date(0)

  if (timeRange === 'today') {
    currentCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    priorCutoffEnd = new Date(currentCutoff.getTime())
    priorCutoffStart = new Date(currentCutoff.getTime() - 24 * 60 * 60 * 1000)
  } else if (timeRange === '7d') {
    currentCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    priorCutoffEnd = new Date(currentCutoff.getTime())
    priorCutoffStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  } else if (timeRange === '30d') {
    currentCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    priorCutoffEnd = new Date(currentCutoff.getTime())
    priorCutoffStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  } else {
    // 'all' time: current window is last 30 days, prior is preceding 30 days
    currentCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    priorCutoffEnd = new Date(currentCutoff.getTime())
    priorCutoffStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  }

  const events = timeRange === 'all'
    ? allEvents
    : allEvents.filter((e) => new Date(e.timestamp) >= currentCutoff)

  const priorEvents = allEvents.filter(
    (e) => new Date(e.timestamp) >= priorCutoffStart && new Date(e.timestamp) < priorCutoffEnd
  )

  const totalViews = events.length
  const uniqueVisitors = new Set(events.map((e) => e.sessionId)).size
  const priorViews = priorEvents.length
  const priorUniques = new Set(priorEvents.map((e) => e.sessionId)).size

  // Average Reading Time Calculation from recorded durations
  const durations = events.filter(
    (e) => typeof e.durationSeconds === 'number' && e.durationSeconds >= 5 && e.durationSeconds <= 1800
  )
  const avgSeconds = durations.length > 0
    ? durations.reduce((sum, e) => sum + (e.durationSeconds || 0), 0) / durations.length
    : 0
  const avgReadingTimeMinutes = Number((avgSeconds / 60).toFixed(1))

  const priorDurations = priorEvents.filter(
    (e) => typeof e.durationSeconds === 'number' && e.durationSeconds >= 5 && e.durationSeconds <= 1800
  )
  const priorAvgSeconds = priorDurations.length > 0
    ? priorDurations.reduce((sum, e) => sum + (e.durationSeconds || 0), 0) / priorDurations.length
    : 0
  const priorAvgMinutes = Number((priorAvgSeconds / 60).toFixed(1))


  // Dynamic Metric Trends
  const trends = {
    views: calculateTrend(totalViews, priorViews),
    uniques: calculateTrend(uniqueVisitors, priorUniques),
    readingTime: calculateTrend(avgReadingTimeMinutes, priorAvgMinutes),
  }

  const previousPeriod: PeriodComparison = {
    totalViews: priorViews,
    uniqueVisitors: priorUniques,
    viewsGrowthPercentage: trends.views.value,
    uniquesGrowthPercentage: trends.uniques.value,
  }

  // Time-Series Aggregation with Zero-Padding
  const timeSeriesMap = new Map<string, { views: number; uniques: Set<string> }>()

  if (timeRange === 'today') {
    for (let h = 0; h <= 23; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`
      timeSeriesMap.set(label, { views: 0, uniques: new Set() })
    }
    for (const ev of events) {
      const d = new Date(ev.timestamp)
      const label = `${d.getHours().toString().padStart(2, '0')}:00`
      const current = timeSeriesMap.get(label)
      if (current) {
        current.views++
        current.uniques.add(ev.sessionId)
      }
    }
  } else {
    const rangeDays = timeRange === '7d' ? 7 : 30
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().slice(5, 10)
      timeSeriesMap.set(key, { views: 0, uniques: new Set() })
    }
    for (const ev of events) {
      const key = ev.timestamp.slice(5, 10)
      const current = timeSeriesMap.get(key)
      if (current) {
        current.views++
        current.uniques.add(ev.sessionId)
      }
    }
  }

  const timeSeries: TimeSeriesPoint[] = Array.from(timeSeriesMap.entries()).map(([key, val]) => ({
    label: key,
    date: key,
    views: val.views,
    uniques: val.uniques.size,
  }))

  // Top Countries Breakdown
  const countryCounts = new Map<string, { code: string; name: string; count: number }>()
  for (const ev of events) {
    const code = ev.country || 'US'
    const name = ev.countryName || COUNTRY_NAMES[code] || code
    const existing = countryCounts.get(code) || { code, name, count: 0 }
    existing.count++
    countryCounts.set(code, existing)
  }

  const topCountries: CountryStat[] = Array.from(countryCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((c) => ({
      code: c.code,
      name: c.name,
      views: c.count,
      percentage: totalViews > 0 ? Math.round((c.count / totalViews) * 100) : 0,
    }))

  // Top Articles
  let articleMetaMap = new Map<string, { category: string; title: string }>()
  let realPublishedCount = 0
  let realPinnedCount = 0
  try {
    const { localStore } = require('./localStore')
    const arts = localStore.getAll()
    realPublishedCount = arts.filter((a: any) => a.status === 'published').length
    realPinnedCount = arts.filter((a: any) => a.status === 'published' && typeof a.homepage_position === 'number').length
    for (const a of arts) {
      if (a.slug) {
        articleMetaMap.set(a.slug, { category: a.category || 'News', title: a.title || '' })
      }
    }
  } catch {}

  const articleCounts = new Map<string, { slug: string; title: string; count: number }>()
  for (const ev of events) {
    if (ev.slug) {
      const dbMeta = articleMetaMap.get(ev.slug)
      const existing = articleCounts.get(ev.slug) || {
        slug: ev.slug,
        title: dbMeta?.title || ev.title || ev.slug.replace(/-/g, ' '),
        count: 0,
      }
      existing.count++
      articleCounts.set(ev.slug, existing)
    }
  }

  const topArticles: ArticleStat[] = Array.from(articleCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((a) => {
      const dbMeta = articleMetaMap.get(a.slug)
      return {
        slug: a.slug,
        title: a.title,
        category: dbMeta?.category || 'News',
        views: a.count,
      }
    })

  // Referrers
  const referrerCounts = new Map<string, number>()
  for (const ev of events) {
    const ref = ev.referrer || 'Direct / Broadsheet Bookmark'
    referrerCounts.set(ref, (referrerCounts.get(ref) || 0) + 1)
  }

  const topReferrers: ReferrerStat[] = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
    }))

  // Device Breakdown
  const deviceBreakdown: DeviceBreakdown = { desktop: 0, mobile: 0, tablet: 0 }
  for (const ev of events) {
    if (ev.device === 'mobile') deviceBreakdown.mobile++
    else if (ev.device === 'tablet') deviceBreakdown.tablet++
    else deviceBreakdown.desktop++
  }

  return {
    totalViews,
    uniqueVisitors,
    avgReadingTimeMinutes,
    avgReadingTime: avgReadingTimeMinutes,
    publishedArticlesCount: realPublishedCount,
    activeArticles: realPublishedCount,
    pinnedSlotsCount: realPinnedCount,
    pinnedSlots: realPinnedCount,
    timeSeries,
    viewsOverTime: timeSeries,
    topCountries,
    regionalBreakdown: topCountries,
    topArticles,
    topReferrers,
    referrerBreakdown: topReferrers,
    deviceBreakdown,
    trends,
    previousPeriod,
  }
}

