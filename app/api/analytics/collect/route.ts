import { NextRequest, NextResponse } from 'next/server'
import {
  recordAnalyticsEvent,
  generatePrivacySessionId,
  detectCountryCode,
  classifyDevice,
  classifyReferrer,
} from '@/lib/analytics'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    let body: any = {}
    try {
      const text = await req.text()
      if (text && text.trim().length > 0) {
        body = JSON.parse(text)
      }
    } catch {
      // Graceful fallback for non-JSON or malformed beacon payload
    }

    const path = typeof body.path === 'string' ? body.path.trim() : '/'

    // Gating: Ignore editorial admin routes, API endpoints, and internal assets
    if (
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.startsWith('/_next') ||
      path === '/favicon.ico'
    ) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 })
    }

    // 1. IP extraction (Used ONLY for hashing, zero PII persisted)
    const forwarded = req.headers.get('x-forwarded-for')
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1'

    const userAgent = req.headers.get('user-agent') || ''

    // 2. Cryptographic Privacy-Preserving Session Hash
    const sessionId = generatePrivacySessionId(clientIp, userAgent, body.sessionId)

    // 3. Robust 5-Stage Geo Fallback Chain
    const geo = detectCountryCode(req.headers, {
      country: body.country,
      timezone: body.timezone,
      locale: body.language || body.locale,
    })

    // 4. Device Modality Classification
    const device = classifyDevice(userAgent, body.device)

    // 5. Acquisition Channel / Referrer Classification
    const rawReferrer = req.headers.get('referer') || body.referrer || ''
    const referrer = classifyReferrer(rawReferrer, req.headers.get('host') || undefined)

    // 6. Active Reader Attention Telemetry
    const durationSeconds =
      typeof body.durationSeconds === 'number' && body.durationSeconds > 0
        ? Math.min(1800, Math.round(body.durationSeconds))
        : undefined

    // 7. Record Telemetry Event (Zero PII Saved)
    await recordAnalyticsEvent({
      path,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      title: typeof body.title === 'string' ? body.title : undefined,
      country: geo.code,
      countryName: geo.name,
      device,
      referrer,
      sessionId,
      durationSeconds,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('Analytics collect error:', error)
    // Non-blocking guarantee: return 200 OK so client beacons never report errors
    return NextResponse.json({ ok: true, fallback: true }, { status: 200 })
  }
}

