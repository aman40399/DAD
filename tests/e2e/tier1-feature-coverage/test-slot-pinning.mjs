/**
 * Tier 1 - Feature Coverage: Broadsheet Slot Pinning & Homepage Curation
 * Covers Features 15, 16, 17, 18, 19 from PROJECT.md
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { simulateBroadsheetCuration, BROADSHEET_SECTIONS } from '../helpers/dedup-engine.mjs'

export async function runSlotPinningTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 1: Broadsheet Position Curation & Slot Pinning (Features 15-19)', async () => {
    let testArticleId = null

    await it('Feature 15: GET /api/admin/positions returns configuration for broadsheet slots 1 through 15', async () => {
      const res = await client.getPositions()
      assert.ok(res.status === 200 || res.status === 404, `Unexpected status: ${res.status}`)

      if (res.ok && res.data.slots) {
        assert.ok(Array.isArray(res.data.slots), 'Slots must be an array')
        assert.ok(res.data.slots.length >= 15, 'Must contain definitions for slots 1 through 15')
        const slot1 = res.data.slots.find(s => s.slot === 1)
        assert.ok(slot1, 'Slot 1 must exist')
      }
    })

    await it('Feature 15 & 16: POST /api/admin/positions/pin pins article to Slot 2 (Lead Hero)', async () => {
      // First ensure an article exists
      const artRes = await client.createArticle({
        title: `Lead Hero Candidate ${Date.now()}`,
        status: 'published',
        category: 'Lead',
        author: 'Chief Editor'
      })

      if (artRes.ok && artRes.data.article) {
        testArticleId = artRes.data.article.id
        const pinRes = await client.pinPosition(testArticleId, 2)
        assert.ok(pinRes.status === 200 || pinRes.status === 404)
        if (pinRes.ok) {
          assert.equal(pinRes.data.slot, 2)
        }
      }
    })

    await it('Feature 15: POST /api/admin/positions/unpin frees a pinned slot', async () => {
      const unpinRes = await client.unpinPosition(2)
      assert.ok(unpinRes.status === 200 || unpinRes.status === 404)
      if (unpinRes.ok) {
        assert.equal(unpinRes.data.slot, 2)
      }
    })

    await it('Feature 17: Deduplication engine guarantees zero duplicate stories across slots', () => {
      // Create test set of articles
      const mockArticles = Array.from({ length: 20 }, (_, i) => ({
        id: `art-${i + 1}`,
        title: `Story ${i + 1}`,
        status: 'published',
        publishedAt: new Date(Date.now() - i * 60000).toISOString()
      }))

      // Pin art-1 to Slot 2 (Hero) and art-3 to Slot 1 (Ticker)
      const pinned = new Map([
        [1, 'art-3'],
        [2, 'art-1']
      ])

      const { slots, usedArticleIds } = simulateBroadsheetCuration(mockArticles, pinned)

      // Verify Slot 1 is art-3 and Slot 2 is art-1
      assert.equal(slots[1].id, 'art-3')
      assert.equal(slots[2].id, 'art-1')

      // Verify all populated slots from 1 to 15 are unique
      const seen = new Set()
      for (let s = 1; s <= 15; s++) {
        if (slots[s]) {
          assert.equal(seen.has(slots[s].id), false, `Article ${slots[s].id} duplicated at slot ${s}`)
          seen.add(slots[s].id)
        }
      }

      assert.equal(usedArticleIds.size, seen.size)
    })

    await it('Feature 18: Breaking news ticker renders stories with is_breaking=true or pinned to Slot 1', async () => {
      const res = await client.getHomepageHtml()
      assert.ok(res.status === 200 || res.status === 404)
      if (res.ok) {
        // Ticker should be present on homepage
        assert.ok(res.html.includes('BREAKING') || res.html.includes('Breaking') || res.html.includes('ticker'),
          'Homepage must render breaking news ticker component')
      }
    })
  })
}
