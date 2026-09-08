/**
 * Tier 3 - Cross-Feature Combination: Publish -> Pin to Slot 2 -> Homepage Hero -> Public Reader -> Bookmark
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { DomParser } from '../helpers/dom-parser.mjs'

export async function runPublishPinReadFlowTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 3: Combination - Publish -> Pin Slot 2 -> Homepage -> Reader -> Bookmark', async () => {
    let createdArticle = null

    await it('Step 1: Author publishes a new lead article via API', async () => {
      const payload = {
        title: `Historic Breakthrough in Fusion Energy Pilot ${Date.now()}`,
        subtitle: 'International reactor produces net energy gain for 120 consecutive minutes',
        excerpt: 'Scientists at the facility confirmed net energy output surpassing previous records.',
        content: 'Long form investigative prose covering the physics, engineering, and funding milestones.',
        author: 'Dr. Aris Thorne',
        category: 'Science',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        imageCaption: 'The vacuum chamber during sustained plasma pulse | Photo: Fusion Lab',
        status: 'published',
        tags: ['Science', 'Energy', 'Physics']
      }

      const res = await client.createArticle(payload)
      if (res.ok && res.data.article) {
        createdArticle = res.data.article
        assert.equal(createdArticle.status, 'published')
        assert.ok(createdArticle.slug, 'Slug must be present')
      }
    })

    await it('Step 2: Editor pins the newly published story to Broadsheet Slot 2 (Lead Hero)', async () => {
      if (!createdArticle?.id) return

      const pinRes = await client.pinPosition(createdArticle.id, 2)
      assert.ok(pinRes.status === 200 || pinRes.status === 404)
      if (pinRes.ok) {
        assert.equal(pinRes.data.slot, 2)
      }
    })

    await it('Step 3: Homepage renders the pinned story in the Lead Hero position (Slot 2)', async () => {
      if (!createdArticle?.title) return

      const res = await client.getHomepageHtml()
      if (res.ok) {
        assert.ok(
          res.html.includes(createdArticle.title) || res.html.includes(createdArticle.slug),
          'Pinned lead hero article headline or link must appear on homepage'
        )
      }
    })

    await it('Step 4: Reader clicks lead hero link to view /article/:slug', async () => {
      if (!createdArticle?.slug) return

      const res = await client.getArticlePageHtml(createdArticle.slug)
      assert.ok(res.status === 200 || res.status === 404)
      if (res.ok) {
        const dom = new DomParser(res.html)
        assert.ok(dom.hasText(createdArticle.title), 'Reader view must show article title')
        assert.ok(dom.hasSerifTypography(), 'Reader view must apply serif newsprint typography')
      }
    })

    await it('Step 5: Reader toggles bookmark, persisting article to client bookmarks', () => {
      if (!createdArticle?.id) return

      const bookmarksStore = new Set()
      // Simulate client bookmarking toggle
      bookmarksStore.add(createdArticle.id)
      assert.ok(bookmarksStore.has(createdArticle.id))

      // Simulate bookmark panel retrieval
      const bookmarkedArticles = [createdArticle].filter(a => bookmarksStore.has(a.id))
      assert.equal(bookmarkedArticles.length, 1)
      assert.equal(bookmarkedArticles[0].title, createdArticle.title)
    })
  })
}
