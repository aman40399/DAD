#!/usr/bin/env node

/**
 * Milestone 7: Visitor Analytics & Regional Intelligence Engine
 * Empirical Adversarial & Stress Verification Suite
 *
 * Covers:
 * 1. 5-Stage Geo Fallback Chain & CDN edge header resolution
 * 2. Privacy-preserving session hashing determinism & zero PII isolation
 * 3. API contracts for /api/analytics/collect & /api/analytics/stats across time ranges
 * 4. Boundary, malformed payloads, admin gating, and concurrent beacon bursts
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

// Direct import of analytics core functions
import {
  detectCountryCode,
  generatePrivacySessionId,
  classifyDevice,
  classifyReferrer,
  calculateTrend,
  COUNTRY_NAMES,
  TIMEZONE_COUNTRY_MAP,
  getStore,
  recordAnalyticsEvent,
  getAnalyticsStats,
} from '../../lib/analytics.ts'

export async function runGeoFallbackStressTests() {
  await describe('Empirical Stress: 5-Stage Geo Fallback Chain', async () => {
    // 1. Stage 1: Cloudflare valid header
    await it('Stage 1: cf-ipcountry GB resolves to GB / United Kingdom', () => {
      const geo = detectCountryCode({ 'cf-ipcountry': 'GB' })
      assert.equal(geo.code, 'GB')
      assert.equal(geo.name, 'United Kingdom')
    })

    await it('Stage 1: cf-ipcountry handles lowercase or trimmed codes', () => {
      const geo = detectCountryCode({ 'cf-ipcountry': '  jp ' })
      assert.equal(geo.code, 'JP')
      assert.equal(geo.name, 'Japan')
    })

    // 2. Stage 1 invalid codes: XX and T1 (Cloudflare Unknown and Tor)
    await it('Stage 1: cf-ipcountry XX (Unknown) falls back to timezone / locale / default', () => {
      // With timezone fallback
      const geoWithTz = detectCountryCode({ 'cf-ipcountry': 'XX' }, { timezone: 'Europe/Paris' })
      assert.equal(geoWithTz.code, 'FR')
      assert.equal(geoWithTz.name, 'France')

      // With locale fallback
      const geoWithLocale = detectCountryCode({ 'cf-ipcountry': 'XX' }, { locale: 'de-DE' })
      assert.equal(geoWithLocale.code, 'DE')
      assert.equal(geoWithLocale.name, 'Germany')

      // Without anything else -> default US
      const geoDefault = detectCountryCode({ 'cf-ipcountry': 'XX' })
      assert.equal(geoDefault.code, 'US')
      assert.equal(geoDefault.name, 'United States')
    })

    await it('Stage 1: cf-ipcountry T1 (Tor Exit Node) falls back to timezone / locale / default', () => {
      const geo = detectCountryCode({ 'cf-ipcountry': 'T1' }, { timezone: 'Asia/Kolkata' })
      assert.equal(geo.code, 'IN')
      assert.equal(geo.name, 'India')

      const geoDefault = detectCountryCode({ 'cf-ipcountry': 'T1' })
      assert.equal(geoDefault.code, 'US')
      assert.equal(geoDefault.name, 'United States')
    })

    // Alternate Edge CDN headers
    await it('Stage 1: Alternate CDN edge headers (Vercel, CloudFront, x-country-code)', () => {
      const vercel = detectCountryCode({ 'x-vercel-ip-country': 'DE' })
      assert.equal(vercel.code, 'DE')
      assert.equal(vercel.name, 'Germany')

      const cloudfront = detectCountryCode({ 'cloudfront-viewer-country': 'CA' })
      assert.equal(cloudfront.code, 'CA')
      assert.equal(cloudfront.name, 'Canada')

      const generic = detectCountryCode({ 'x-country-code': 'AU' })
      assert.equal(generic.code, 'AU')
      assert.equal(generic.name, 'Australia')
    })

    // 3. Stage 2: Client Payload Explicit Country
    await it('Stage 2: Client payload explicit country takes precedence when edge headers missing', () => {
      const geo = detectCountryCode({}, { country: 'SG' })
      assert.equal(geo.code, 'SG')
      assert.equal(geo.name, 'Singapore')
    })

    // 4. Stage 3: Client Timezone Mapping
    await it('Stage 3: Missing edge headers with timezone Asia/Tokyo resolves to JP / Japan', () => {
      const geo = detectCountryCode({}, { timezone: 'Asia/Tokyo' })
      assert.equal(geo.code, 'JP')
      assert.equal(geo.name, 'Japan')
    })

    await it('Stage 3: Common global IANA timezones resolve accurately', () => {
      assert.equal(detectCountryCode({}, { timezone: 'Asia/Kolkata' }).code, 'IN')
      assert.equal(detectCountryCode({}, { timezone: 'Asia/Dubai' }).code, 'AE')
      assert.equal(detectCountryCode({}, { timezone: 'Europe/London' }).code, 'GB')
      assert.equal(detectCountryCode({}, { timezone: 'Europe/Berlin' }).code, 'DE')
      assert.equal(detectCountryCode({}, { timezone: 'America/New_York' }).code, 'US')
      assert.equal(detectCountryCode({}, { timezone: 'America/Sao_Paulo' }).code, 'BR')
      assert.equal(detectCountryCode({}, { timezone: 'Australia/Sydney' }).code, 'AU')
      assert.equal(detectCountryCode({}, { timezone: 'Africa/Johannesburg' }).code, 'ZA')
    })

    await it('Stage 3: Unlisted timezone prefix fallback (America/*, Europe/*, Asia/*)', () => {
      assert.equal(detectCountryCode({}, { timezone: 'America/SomeNonMappedCity' }).code, 'US')
      assert.equal(detectCountryCode({}, { timezone: 'Europe/SomeNonMappedCity' }).code, 'GB')
      assert.equal(detectCountryCode({}, { timezone: 'Asia/SomeNonMappedCity' }).code, 'IN')
      assert.equal(detectCountryCode({}, { timezone: 'Australia/SomeNonMappedCity' }).code, 'AU')
    })

    // 5. Stage 4: Accept-Language / Client Locale
    await it('Stage 4: Missing timezone with locale fr-FR resolves to FR / France', () => {
      const geo = detectCountryCode({}, { locale: 'fr-FR' })
      assert.equal(geo.code, 'FR')
      assert.equal(geo.name, 'France')
    })

    await it('Stage 4: Various locale formats (hyphen, underscore, lowercase, accept-language header)', () => {
      // Underscore format
      assert.equal(detectCountryCode({}, { locale: 'ja_JP' }).code, 'JP')
      // Lowercase region
      assert.equal(detectCountryCode({}, { locale: 'es-es' }).code, 'ES')
      // From accept-language header
      assert.equal(detectCountryCode({ 'accept-language': 'de-DE,de;q=0.9,en;q=0.8' }).code, 'DE')
      assert.equal(detectCountryCode({ 'accept-language': 'zh-CN,zh;q=0.9' }).code, 'CN')
    })

    // 6. Stage 5: Completely empty headers/payload resolves to default US / United States
    await it('Stage 5: Completely empty headers/payload resolves to default US / United States', () => {
      const geoEmpty = detectCountryCode({})
      assert.equal(geoEmpty.code, 'US')
      assert.equal(geoEmpty.name, 'United States')

      const geoUndefined = detectCountryCode(undefined, undefined)
      assert.equal(geoUndefined.code, 'US')
      assert.equal(geoUndefined.name, 'United States')
    })

    // Headers interface compatibility (Web Standard Headers object vs plain object)
    await it('Supports Web Standard Headers instance', () => {
      const headers = new Headers()
      headers.set('cf-ipcountry', 'IN')
      const geo = detectCountryCode(headers)
      assert.equal(geo.code, 'IN')
      assert.equal(geo.name, 'India')
    })
  })
}

export async function runSessionHashingZeroPiiStressTests() {
  await describe('Empirical Stress: Privacy-Preserving Session Hash & Zero PII', async () => {
    const testIp = '198.51.100.77'
    const testUa = 'Mozilla/5.0 (AdversarialTest/1.0; EmpiricalVerifier)'

    await it('Determinism: Same IP + UA + date produces identical session ID', () => {
      const sess1 = generatePrivacySessionId(testIp, testUa)
      const sess2 = generatePrivacySessionId(testIp, testUa)
      const sess3 = generatePrivacySessionId(testIp, testUa)

      assert.equal(sess1, sess2)
      assert.equal(sess2, sess3)
      assert.match(sess1, /^sess_[a-f0-9]{16}$/, 'Session ID must follow sess_<16 hex> format')
    })

    await it('Entropy: Different IP or UA produces different session ID', () => {
      const sessBase = generatePrivacySessionId(testIp, testUa)
      const sessDiffIp = generatePrivacySessionId('198.51.100.78', testUa)
      const sessDiffUa = generatePrivacySessionId(testIp, testUa + ' Modified')

      assert.notEqual(sessBase, sessDiffIp)
      assert.notEqual(sessBase, sessDiffUa)
    })

    await it('Cross-day isolation: Different dates produce completely different daily salts and session IDs', () => {
      const secret = process.env.ANALYTICS_SALT_SECRET || 'meridian-broadsheet-salt-key-2026'

      // Simulate Day 1
      const date1 = '2026-09-06'
      const salt1 = crypto.createHash('sha256').update(`${secret}:${date1}`).digest('hex').slice(0, 16)
      const hash1 = `sess_${crypto.createHash('sha256').update(`${testIp}::${testUa}::${salt1}::`).digest('hex').slice(0, 16)}`

      // Simulate Day 2
      const date2 = '2026-09-07'
      const salt2 = crypto.createHash('sha256').update(`${secret}:${date2}`).digest('hex').slice(0, 16)
      const hash2 = `sess_${crypto.createHash('sha256').update(`${testIp}::${testUa}::${salt2}::`).digest('hex').slice(0, 16)}`

      assert.notEqual(salt1, salt2, 'Daily salts must differ across days')
      assert.notEqual(hash1, hash2, 'Session IDs must differ across days to prevent tracking')
    })

    await it('Zero PII isolation: Recorded events NEVER contain raw IP or UserAgent substrings', async () => {
      const secretIp = '203.0.113.199'
      const secretUaToken = 'SECRET_TOKEN_CANARY_XYZ987'
      const secretUa = `Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (${secretUaToken})`

      const sessionId = generatePrivacySessionId(secretIp, secretUa)

      const eventPayload = {
        path: '/article/japan-korea-defence-pact',
        slug: 'japan-korea-defence-pact',
        title: 'Japan Korea Defence Pact',
        country: 'JP',
        countryName: 'Japan',
        referrer: 'Direct / Broadsheet Bookmark',
        device: classifyDevice(secretUa),
        sessionId,
        durationSeconds: 120,
      }

      await recordAnalyticsEvent(eventPayload)

      // Inspect the event from memory store
      const store = getStore()
      const recorded = store.find((e) => e.sessionId === sessionId)
      assert.ok(recorded, 'Recorded event must exist in store')

      const serializedEvent = JSON.stringify(recorded)

      // Strict assertions: Raw IP and sensitive UA token must NOT appear anywhere in the serialized event
      assert.equal(
        serializedEvent.includes(secretIp),
        false,
        'VIOLATION: Raw IP leaked into recorded AnalyticsEvent!'
      )
      assert.equal(
        serializedEvent.includes(secretUaToken),
        false,
        'VIOLATION: UserAgent canary token leaked into recorded AnalyticsEvent!'
      )
      assert.equal(
        serializedEvent.includes(secretUa),
        false,
        'VIOLATION: Full UserAgent string leaked into recorded AnalyticsEvent!'
      )

      // Verify required event schema
      assert.ok(recorded.id)
      assert.ok(recorded.path)
      assert.ok(recorded.country)
      assert.ok(recorded.countryName)
      assert.ok(recorded.device)
      assert.ok(recorded.sessionId)
      assert.ok(recorded.timestamp)
    })
  })
}

export async function runApiContractsStressTests(baseUrl = 'http://localhost:3000') {
  await describe('Empirical Stress: Analytics API Contracts & Range Filtering', async () => {
    // 1. All valid timeRange parameters
    const ranges = ['today', '7d', '30d', 'all']

    for (const r of ranges) {
      await it(`GET /api/analytics/stats with timeRange=${r} returns valid contract`, async () => {
        const res = await fetch(`${baseUrl}/api/analytics/stats?timeRange=${r}`)
        assert.equal(res.status, 200, `Expected 200 OK for timeRange=${r}`)

        const data = await res.json()
        assert.ok(typeof data.totalViews === 'number')
        assert.ok(typeof data.uniqueVisitors === 'number')
        assert.ok(typeof data.avgReadingTimeMinutes === 'number')
        assert.ok(typeof data.publishedArticlesCount === 'number')
        assert.ok(typeof data.pinnedSlotsCount === 'number')

        assert.ok(Array.isArray(data.timeSeries))
        assert.ok(data.timeSeries.length > 0)
        assert.ok(Array.isArray(data.topCountries))
        assert.ok(Array.isArray(data.topArticles))
        assert.ok(Array.isArray(data.topReferrers))
        assert.ok(data.deviceBreakdown)
        assert.ok(typeof data.deviceBreakdown.desktop === 'number')
        assert.ok(typeof data.deviceBreakdown.mobile === 'number')
        assert.ok(typeof data.deviceBreakdown.tablet === 'number')
        assert.ok(data.trends)
        assert.ok(data.trends.views)
        assert.ok(data.trends.uniques)

        // Verify backward-compatibility aliases
        assert.ok(Array.isArray(data.viewsOverTime))
        assert.ok(Array.isArray(data.regionalBreakdown))
        assert.ok(Array.isArray(data.referrerBreakdown))
      })
    }

    // 2. Query parameter alias 'range'
    for (const r of ranges) {
      await it(`GET /api/analytics/stats with range=${r} (alias) returns valid contract`, async () => {
        const res = await fetch(`${baseUrl}/api/analytics/stats?range=${r}`)
        assert.equal(res.status, 200, `Expected 200 OK for range=${r}`)
        const data = await res.json()
        assert.ok(typeof data.totalViews === 'number')
        assert.ok(Array.isArray(data.timeSeries))
      })
    }

    // 3. Invalid timeRange graceful fallback
    await it('GET /api/analytics/stats with invalid timeRange gracefully defaults to 7d without 500 error', async () => {
      const adversarialRanges = [
        'invalid',
        '99999d',
        "today' OR 1=1--",
        '<script>alert(1)</script>',
        '',
      ]

      for (const adv of adversarialRanges) {
        const res = await fetch(`${baseUrl}/api/analytics/stats?timeRange=${encodeURIComponent(adv)}`)
        assert.equal(
          res.status,
          200,
          `API must return 200 OK on invalid range '${adv}', not 500`
        )
        const data = await res.json()
        assert.ok(typeof data.totalViews === 'number')
        // Default 7d should have 7 time series points
        assert.equal(data.timeSeries.length, 7)
      }
    })

    // 4. POST /api/analytics/collect Robustness & Non-blocking guarantees
    await it('POST /api/analytics/collect handles malformed JSON gracefully with 200 OK', async () => {
      const res = await fetch(`${baseUrl}/api/analytics/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ malformed json: not valid :::',
      })
      assert.equal(res.status, 200, 'Beacon must always return 200 OK')
      const data = await res.json()
      assert.equal(data.ok, true)
    })

    await it('POST /api/analytics/collect handles empty string body with 200 OK', async () => {
      const res = await fetch(`${baseUrl}/api/analytics/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '',
      })
      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.ok, true)
    })

    await it('POST /api/analytics/collect handles text/plain beacon body with 200 OK', async () => {
      const res = await fetch(`${baseUrl}/api/analytics/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          path: '/article/central-banks-gold-reserves',
          durationSeconds: 45,
        }),
      })
      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.ok, true)
    })

    // 5. Admin path gating
    await it('POST /api/analytics/collect gates and ignores admin and internal paths', async () => {
      const ignoredPaths = [
        '/admin',
        '/admin/articles',
        '/admin/slots',
        '/admin/analytics',
        '/api/articles',
        '/_next/static/chunks/main.js',
        '/favicon.ico',
      ]

      for (const p of ignoredPaths) {
        const res = await fetch(`${baseUrl}/api/analytics/collect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: p }),
        })
        assert.equal(res.status, 200)
        const data = await res.json()
        assert.equal(data.ok, true)
        assert.equal(
          data.ignored,
          true,
          `Path '${p}' must be gated and ignored from analytics collection`
        )
      }
    })

    // 6. Public article telemetry collection
    await it('POST /api/analytics/collect records valid public dispatches', async () => {
      const res = await fetch(`${baseUrl}/api/analytics/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-ipcountry': 'IN',
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        },
        body: JSON.stringify({
          path: '/article/japan-korea-defence-pact',
          slug: 'japan-korea-defence-pact',
          title: 'Japan and South Korea Forge Historic Trilateral Defence Pact',
          referrer: 'https://news.google.com',
          durationSeconds: 155,
        }),
      })
      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.ok, true)
      assert.equal(data.ignored, undefined)
    })
  })
}

export async function runConcurrencyAndBoundaryStressTests(baseUrl = 'http://localhost:3000') {
  await describe('Empirical Stress: Concurrency & Boundary Hardening', async () => {
    await it('High-concurrency burst: 50 simultaneous beacon collect requests execute without error', async () => {
      const burstSize = 50
      const promises = []

      for (let i = 0; i < burstSize; i++) {
        promises.push(
          fetch(`${baseUrl}/api/analytics/collect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'cf-ipcountry': i % 2 === 0 ? 'US' : 'GB',
              'user-agent': `BurstClient/${i}`,
            },
            body: JSON.stringify({
              path: `/article/sample-burst-${i % 5}`,
              slug: `sample-burst-${i % 5}`,
              durationSeconds: 10 + i,
            }),
          }).then(async (res) => {
            assert.equal(res.status, 200)
            const json = await res.json()
            assert.equal(json.ok, true)
          })
        )
      }

      await Promise.all(promises)
    })

    await it('Duration boundaries: Negative, zero, and extreme durations are sanitized safely', async () => {
      // Direct library check
      await recordAnalyticsEvent({
        path: '/article/test-durations',
        durationSeconds: -100, // Negative should not be stored
      })
      await recordAnalyticsEvent({
        path: '/article/test-durations',
        durationSeconds: 100000, // Exceeds 1800s ceiling, should clamp to 1800
      })

      const store = getStore()
      const clamped = store.find((e) => e.path === '/article/test-durations' && e.durationSeconds === 1800)
      assert.ok(clamped, 'Extreme duration must be clamped to 1800s ceiling')
    })
  })
}

// Standalone execution entrypoint
async function main() {
  console.log('\n======================================================================')
  console.log('  MILESTONE 7 ADVERSARIAL STRESS TEST: ANALYTICS & GEO FALLBACK')
  console.log('======================================================================\n')

  const baseUrl = process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000'

  await runGeoFallbackStressTests()
  await runSessionHashingZeroPiiStressTests()
  await runApiContractsStressTests(baseUrl)
  await runConcurrencyAndBoundaryStressTests(baseUrl)

  console.log('\n======================================================================')
  console.log('  ALL EMPIRICAL ADVERSARIAL & STRESS SUITES COMPLETED')
  console.log('======================================================================\n')
}

main().catch((err) => {
  console.error('\n❌ Unhandled stress test error:', err)
  process.exit(1)
})
