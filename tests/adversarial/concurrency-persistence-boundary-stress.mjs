#!/usr/bin/env node

/**
 * Milestone 7.2: Concurrency, Persistence & Boundary Stress Test Suite
 *
 * Scenarios Tested:
 * 1. Rapid Concurrency & Ingestion (200 concurrent telemetry records directly + 100 route POSTs)
 * 2. Atomic File Swapping & .tmp File Cleanup Verification
 * 3. 15,000 Event Maximum Cap Enforcement & FIFO Trimming (Disk vs Memory Store)
 * 4. Trend Math Boundaries (Division by Zero, Negative Growth, Floor Ceilings)
 * 5. Reading Duration Boundaries (Negative, Non-numeric, [3, 1800] Range Handling)
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const jiti = require('jiti')(process.cwd() + '/index.js', { alias: { '@': process.cwd() } })
const analytics = jiti('./lib/analytics.ts')
const collectRoute = jiti('./app/api/analytics/collect/route.ts')
const statsRoute = jiti('./app/api/analytics/stats/route.ts')

const DATA_DIR = path.join(process.cwd(), 'data')
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json')

export async function runConcurrencyAndPersistenceTests() {
  await describe('Stress Test 1: Concurrency, Rapid Ingestion & Atomic Persistence', async () => {
    await it('Simulates 200 concurrent telemetry records hitting recordAnalyticsEvent', async () => {
      const store = analytics.getStore()
      const burstTag = `concurrency_burst_${Date.now()}`

      const promises = []
      for (let i = 0; i < 200; i++) {
        promises.push(
          analytics.recordAnalyticsEvent({
            path: `/article/stress-test-${i}`,
            slug: `stress-test-${i}`,
            title: `Stress Test Article ${i}`,
            country: i % 2 === 0 ? 'US' : 'GB',
            referrer: 'https://news.google.com',
            device: i % 3 === 0 ? 'desktop' : 'mobile',
            sessionId: `sess_${burstTag}_${i}`,
            durationSeconds: 45 + (i % 100),
          })
        )
      }

      // Concurrently execute all 200 records
      await Promise.all(promises)

      // Wait 1200ms to allow debounce timer to finish flushing any remaining events
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // Verification A: All 200 events recorded in memory
      const burstEvents = store.filter((e) => e.sessionId && e.sessionId.startsWith(`sess_${burstTag}_`))
      assert.equal(
        burstEvents.length,
        200,
        `Expected all 200 events to be ingested into store, got ${burstEvents.length}`
      )

      // Verification B: data/analytics.json exists and is valid parseable JSON
      assert.ok(fs.existsSync(ANALYTICS_FILE), 'analytics.json must exist')
      const rawContent = fs.readFileSync(ANALYTICS_FILE, 'utf-8')
      let parsedDisk
      assert.doesNotThrow(() => {
        parsedDisk = JSON.parse(rawContent)
      }, 'analytics.json must be valid parseable JSON without truncation or syntax corruption')
      assert.ok(Array.isArray(parsedDisk), 'analytics.json content must be an array')

      // Verification C: No orphaned .tmp files in data/ directory
      const tmpFiles = fs.readdirSync(DATA_DIR).filter((f) => f.includes('.analytics.json.') && f.endsWith('.tmp'))
      assert.equal(
        tmpFiles.length,
        0,
        `Expected 0 orphaned .tmp files in ${DATA_DIR}, found: ${tmpFiles.join(', ')}`
      )
    })

    await it('Simulates 100 concurrent requests hitting POST /api/analytics/collect', async () => {
      const routeBurstTag = `route_burst_${Date.now()}`
      const promises = []

      for (let i = 0; i < 100; i++) {
        const isAdmin = i % 10 === 0
        const isMalformed = i % 25 === 1
        const p = isAdmin ? '/admin/dashboard' : `/article/route-test-${i}`

        const body = isMalformed
          ? '{ bad json payload :::'
          : JSON.stringify({
              path: p,
              sessionId: `sess_${routeBurstTag}_${i}`,
              country: i % 2 === 0 ? 'DE' : 'IN',
              durationSeconds: 60,
            })

        const req = new Request('http://localhost:3000/api/analytics/collect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'cf-ipcountry': i % 2 === 0 ? 'DE' : 'IN',
            'user-agent': `BurstClient/${i}`,
          },
          body,
        })

        promises.push(
          collectRoute.POST(req).then(async (res) => {
            assert.equal(res.status, 200, 'Collect route must always return 200')
            const json = await res.json()
            assert.equal(json.ok, true)
            if (isAdmin) {
              assert.equal(json.ignored, true)
            }
          })
        )
      }

      await Promise.all(promises)
    })
  })
}

export async function runEventCapBoundaryTests() {
  await describe('Stress Test 2: Event Cap & Memory Boundary (> 15,000 Events)', async () => {
    await it('Enforces 15,000 maximum cap on disk, preserving newest and trimming oldest', async () => {
      const store = analytics.getStore()
      const originalStore = [...store]

      try {
        // Tag an oldest canary event
        const oldestCanaryId = `ev-canary-oldest-${Date.now()}`
        store.unshift({
          id: oldestCanaryId,
          path: '/article/oldest-canary',
          country: 'US',
          countryName: 'United States',
          referrer: 'Direct',
          device: 'desktop',
          sessionId: 'sess_oldest_canary',
          timestamp: new Date(Date.now() - 10000000).toISOString(),
        })

        // Add events until store exceeds 15,000 events
        const totalNeeded = 15200 - store.length
        for (let i = 0; i < totalNeeded; i++) {
          store.push({
            id: `ev-filler-${i}`,
            path: `/article/filler-${i % 10}`,
            country: 'US',
            countryName: 'United States',
            referrer: 'Direct',
            device: 'desktop',
            sessionId: `sess_filler_${i}`,
            timestamp: new Date().toISOString(),
          })
        }

        // Tag a newest canary event
        const newestCanaryId = `ev-canary-newest-${Date.now()}`
        await analytics.recordAnalyticsEvent({
          id: newestCanaryId,
          path: '/article/newest-canary',
          sessionId: 'sess_newest_canary',
        })

        // Wait for disk flush
        await new Promise((resolve) => setTimeout(resolve, 1200))

        // Read from disk
        const rawContent = fs.readFileSync(ANALYTICS_FILE, 'utf-8')
        const diskEvents = JSON.parse(rawContent)

        // Assertion 1: Disk file must not exceed 15,000 events
        assert.ok(
          diskEvents.length <= 15000,
          `Disk event count ${diskEvents.length} exceeds 15,000 cap!`
        )
        assert.equal(
          diskEvents.length,
          15000,
          `Disk event count should be exactly 15,000 when store exceeds 15,000, got ${diskEvents.length}`
        )

        // Assertion 2: Oldest canary must be trimmed from disk
        const hasOldest = diskEvents.some((e) => e.id === oldestCanaryId)
        assert.equal(
          hasOldest,
          false,
          'Oldest canary event should have been trimmed from disk under 15,000 cap'
        )

        // Assertion 3: Newest canary must be preserved on disk
        const hasNewest = diskEvents.some((e) => e.path === '/article/newest-canary')
        assert.ok(
          hasNewest,
          'Newest canary event must be present on disk'
        )

        // Diagnostic verification of in-memory behavior:
        console.log(`[Diagnostic] In-memory store length: ${store.length}, Disk store length: ${diskEvents.length}`)
      } finally {
        // Restore original store to avoid polluting environment
        store.length = 0
        store.push(...originalStore)
        fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(originalStore, null, 2), 'utf-8')
      }
    })
  })
}

export async function runTrendMathBoundaryTests() {
  await describe('Stress Test 3: Trend Math & Duration Boundaries', async () => {
    await it('calculateTrend handles zero prior period (M_prior = 0) without NaN or Infinity', () => {
      const positiveTrend = analytics.calculateTrend(150, 0)
      assert.equal(positiveTrend.value, 100)
      assert.equal(positiveTrend.changePercentage, 100)
      assert.equal(positiveTrend.formatted, '↑ +100%')
      assert.equal(Number.isNaN(positiveTrend.value), false)
      assert.equal(Number.isFinite(positiveTrend.value), true)

      const zeroTrend = analytics.calculateTrend(0, 0)
      assert.equal(zeroTrend.value, 0)
      assert.equal(zeroTrend.changePercentage, 0)
      assert.equal(zeroTrend.formatted, '— 0.0%')
      assert.equal(Number.isNaN(zeroTrend.value), false)
      assert.equal(Number.isFinite(zeroTrend.value), true)
    })

    await it('calculateTrend handles zero current period (M_curr = 0) accurately', () => {
      const dropTrend = analytics.calculateTrend(0, 80)
      assert.equal(dropTrend.value, -100)
      assert.equal(dropTrend.changePercentage, -100)
      assert.equal(dropTrend.formatted, '↓ -100.0%')
      assert.equal(dropTrend.isPositive, false)

      const zeroZeroTrend = analytics.calculateTrend(0, 0)
      assert.equal(zeroZeroTrend.value, 0)
    })

    await it('Duration sanitization: Negative, zero, and extreme values handled safely in recordAnalyticsEvent', async () => {
      const store = analytics.getStore()

      // 1. Negative duration should not be stored
      await analytics.recordAnalyticsEvent({
        path: '/article/negative-duration',
        durationSeconds: -45,
      })
      const negEvent = store.find((e) => e.path === '/article/negative-duration')
      assert.ok(negEvent)
      assert.equal(negEvent.durationSeconds, undefined, 'Negative duration must not be stored')

      // 2. Zero duration should not be stored
      await analytics.recordAnalyticsEvent({
        path: '/article/zero-duration',
        durationSeconds: 0,
      })
      const zeroEvent = store.find((e) => e.path === '/article/zero-duration')
      assert.ok(zeroEvent)
      assert.equal(zeroEvent.durationSeconds, undefined, 'Zero duration must not be stored')

      // 3. String duration should not be stored
      await analytics.recordAnalyticsEvent({
        path: '/article/string-duration',
        durationSeconds: 'invalid',
      })
      const strEvent = store.find((e) => e.path === '/article/string-duration')
      assert.ok(strEvent)
      assert.equal(strEvent.durationSeconds, undefined, 'String duration must not be stored')

      // 4. Ceiling clamping: Values > 1800s clamped to 1800s
      await analytics.recordAnalyticsEvent({
        path: '/article/ceiling-duration',
        durationSeconds: 7200,
      })
      const ceilEvent = store.find((e) => e.path === '/article/ceiling-duration')
      assert.ok(ceilEvent)
      assert.equal(ceilEvent.durationSeconds, 1800, 'Duration > 1800s must clamp to 1800')
    })

    await it('Empirical Check: Duration range [3, 1800] incorporation into avgReadingTimeMinutes', async () => {
      const store = analytics.getStore()
      const originalStore = [...store]

      try {
        // Clear store to isolate duration math
        store.length = 0

        // Push an event with durationSeconds = 3 (within [3, 1800])
        store.push({
          id: 'ev-test-3s',
          path: '/article/short-read',
          country: 'US',
          countryName: 'United States',
          referrer: 'Direct',
          device: 'desktop',
          sessionId: 'sess_short_3',
          durationSeconds: 3,
          timestamp: new Date().toISOString(),
        })

        const stats = await analytics.getAnalyticsStats('today')
        console.log(`[Diagnostic] Avg reading time for 3s event: ${stats.avgReadingTimeMinutes}m (expected ~0.1m if incorporated, 3.8m if filtered by >=5 floor)`)

        // Check whether 3s was incorporated or filtered by >= 5
        const isDuration3Included = stats.avgReadingTimeMinutes !== 3.8 // 3.8 is the 228s fallback
        console.log(`[Diagnostic] Is duration=3s incorporated into reading time average? ${isDuration3Included}`)
      } finally {
        store.length = 0
        store.push(...originalStore)
      }
    })
  })
}

async function main() {
  console.log('\n============================================================')
  console.log('  CHALLENGER M7.2 EMPIRICAL STRESS & BOUNDARY TEST HARNESS')
  console.log('============================================================\n')

  await runConcurrencyAndPersistenceTests()
  await runEventCapBoundaryTests()
  await runTrendMathBoundaryTests()

  console.log('\n============================================================')
  console.log('  ALL STRESS TEST SUITES EXECUTED')
  console.log('============================================================\n')
}

main().catch((err) => {
  console.error('\n❌ Unhandled failure in stress harness:', err)
  process.exit(1)
})
