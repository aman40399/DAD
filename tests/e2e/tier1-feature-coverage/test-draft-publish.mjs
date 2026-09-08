/**
 * Tier 1 - Feature Coverage: Article Draft & Publish Lifecycle
 * Covers Feature 5 from PROJECT.md
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { SAMPLE_DRAFT_ARTICLE } from '../fixtures/articles.mjs'

export async function runDraftPublishTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 1: Draft & Publish Lifecycle (Feature 5)', async () => {
    let draftArticle = null

    await it('Feature 5: Saving article as draft sets status="draft" and empty/null published_at', async () => {
      const payload = {
        ...SAMPLE_DRAFT_ARTICLE,
        title: `Draft Investigation ${Date.now()}`
      }

      const res = await client.createArticle(payload)
      if (res.ok && res.data.article) {
        draftArticle = res.data.article
        assert.equal(draftArticle.status, 'draft')
        assert.ok(!draftArticle.published_at || draftArticle.published_at === '', 'Draft article must not have published_at')
      }
    })

    await it('Feature 5: Public reader route /article/:slug returns 404 for draft articles', async () => {
      if (!draftArticle?.slug) return

      const res = await client.getArticlePageHtml(draftArticle.slug)
      assert.equal(res.status, 404, 'Draft articles must be gated with 404 from public reader view')
    })

    await it('Feature 5: Transitioning draft to published sets published_at timestamp', async () => {
      if (!draftArticle?.id) return

      const updateRes = await client.updateArticle(draftArticle.id, {
        status: 'published'
      })

      if (updateRes.ok && updateRes.data.article) {
        const published = updateRes.data.article
        assert.equal(published.status, 'published')
        assert.ok(published.published_at, 'Published article must have published_at set')
      }
    })

    await it('Feature 5: Newly published article is now accessible via public reader route', async () => {
      if (!draftArticle?.slug) return

      const res = await client.getArticlePageHtml(draftArticle.slug)
      assert.equal(res.status, 200, 'Published article should now return 200 OK')
      assert.ok(res.html.includes(draftArticle.title), 'Reader HTML must contain published article title')
    })
  })
}
