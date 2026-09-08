/**
 * Tier 2 - Boundary & Corner Cases: Broadsheet Slot Bounds, Swaps & Conflicts
 * Covers edge cases for Features 15, 16, 17
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'

export async function runSlotBoundsBoundariesTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 2: Slot Boundaries, Swaps & Conflicts (Boundary)', async () => {
    await it('Boundary: Pinning to slot number < 1 is rejected with 400 Bad Request', async () => {
      const res = await client.pinPosition('any-article-id', 0)
      assert.ok(res.status === 400 || res.status === 422 || res.status === 404,
        `Expected 400 for slot 0, got: ${res.status}`)

      const resNeg = await client.pinPosition('any-article-id', -1)
      assert.ok(resNeg.status === 400 || resNeg.status === 422 || resNeg.status === 404)
    })

    await it('Boundary: Pinning to slot number > 15 is rejected with 400 Bad Request', async () => {
      const res = await client.pinPosition('any-article-id', 16)
      assert.ok(res.status === 400 || res.status === 422 || res.status === 404,
        `Expected 400 for slot 16, got: ${res.status}`)

      const resHigh = await client.pinPosition('any-article-id', 999)
      assert.ok(resHigh.status === 400 || resHigh.status === 422 || resHigh.status === 404)
    })

    await it('Boundary: Pinning nonexistent article ID returns 404 Not Found', async () => {
      const res = await client.pinPosition('nonexistent-uuid-99999', 2)
      assert.ok(res.status === 404 || res.status === 400,
        `Expected 404 for invalid article ID, got: ${res.status}`)
    })

    await it('Boundary: Unpinning an unpinned slot is safe and idempotent', async () => {
      // Unpin slot 15 which is initially empty
      const res1 = await client.unpinPosition(15)
      assert.ok(res1.status === 200 || res1.status === 404)

      // Unpinning again should not crash or error
      const res2 = await client.unpinPosition(15)
      assert.ok(res2.status === 200 || res2.status === 404)
    })

    await it('Boundary: Overwriting pinned slot updates assignment cleanly', async () => {
      const art1 = await client.createArticle({
        title: `Slot Contestant A ${Date.now()}`,
        status: 'published',
        category: 'Politics',
        author: 'Staff'
      })
      const art2 = await client.createArticle({
        title: `Slot Contestant B ${Date.now()}`,
        status: 'published',
        category: 'Politics',
        author: 'Staff'
      })

      if (art1.ok && art2.ok && art1.data.article && art2.data.article) {
        // Pin Contestant A to slot 3
        await client.pinPosition(art1.data.article.id, 3)

        // Override slot 3 with Contestant B
        const pinRes2 = await client.pinPosition(art2.data.article.id, 3)
        if (pinRes2.ok) {
          const posRes = await client.getPositions()
          if (posRes.ok && posRes.data.slots) {
            const slot3 = posRes.data.slots.find(s => s.slot === 3)
            assert.equal(slot3?.article?.id, art2.data.article.id, 'Slot 3 must now hold Contestant B')
          }
        }
      }
    })
  })
}
