import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

export async function runAnalyticsTelemetryTests(baseUrl) {
  await describe('Tier 1: Visitor Analytics & Regional Intelligence (Features 27-29)', async () => {
    await it('Feature 27: POST /api/analytics/collect receives beacon with geo and path', async () => {
      const res = await fetch(`${baseUrl}/api/analytics/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'cf-ipcountry': 'GB',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        body: JSON.stringify({
          path: '/article/japan-korea-defence-pact',
          sessionId: `test-session-${Date.now()}`,
          referrer: 'https://news.google.com',
        }),
      })

      assert.equal(res.status, 200)
      const data = await res.json()
      assert.equal(data.ok, true)
    })

    await it('Feature 28: GET /api/analytics/stats returns aggregated metrics across timeframes', async () => {
      const ranges = ['today', '7d', '30d', 'all']

      for (const range of ranges) {
        const res = await fetch(`${baseUrl}/api/analytics/stats?range=${range}`)
        assert.equal(res.status, 200)
        const stats = await res.json()

        assert.ok(typeof stats.totalViews === 'number')
        assert.ok(typeof stats.uniqueVisitors === 'number')
        assert.ok(Array.isArray(stats.timeSeries), 'timeSeries must be an array')
        assert.ok(stats.timeSeries.length > 0, 'timeSeries must have data points')
        assert.ok(Array.isArray(stats.topCountries), 'topCountries must be an array')
        assert.ok(Array.isArray(stats.topArticles), 'topArticles must be an array')
        assert.ok(stats.deviceBreakdown, 'deviceBreakdown must exist')
      }
    })

    await it('Feature 29: Regional distribution breakdown includes valid country codes and percentages', async () => {
      const res = await fetch(`${baseUrl}/api/analytics/stats?range=7d`)
      const stats = await res.json()

      assert.ok(stats.topCountries.length > 0)
      const topCountry = stats.topCountries[0]
      assert.ok(topCountry.code, 'Country must have code')
      assert.ok(topCountry.name, 'Country must have name')
      assert.ok(topCountry.percentage >= 0 && topCountry.percentage <= 100)
    })
  })
}
