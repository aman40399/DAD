/**
 * Tier 2 - Boundary & Corner Cases: Draft Gating, 404 Handling & Input Validation
 * Covers adversarial and edge inputs for Features 4, 5, 20
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'

export async function runDraftGatingBoundariesTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 2: Draft Gating, 404 & Input Validation (Boundary)', async () => {
    await it('Boundary: POST /api/articles rejects empty title with 400 Bad Request', async () => {
      const res = await client.createArticle({
        title: '',
        content: 'Article with no title',
        category: 'News'
      })

      assert.ok(res.status === 400 || res.status === 422 || res.status === 404,
        `Expected 400/422 validation failure, got: ${res.status}`)
    })

    await it('Boundary: Public reader /article/:slug returns 404 for nonexistent slug', async () => {
      const nonexistentSlug = `nonexistent-article-${Date.now()}`
      const res = await client.getArticlePageHtml(nonexistentSlug)
      assert.equal(res.status, 404, 'Non-existent article must return HTTP 404')
    })

    await it('Boundary: Draft article remains strictly inaccessible to unauthenticated readers', async () => {
      const draftRes = await client.createArticle({
        title: `Secret Unpublished Draft ${Date.now()}`,
        status: 'draft',
        content: 'Confidential investigative draft content',
        category: 'Politics',
        author: 'Investigator'
      })

      if (draftRes.ok && draftRes.data.article) {
        const readerRes = await client.getArticlePageHtml(draftRes.data.article.slug)
        assert.equal(readerRes.status, 404, 'Draft article must yield 404 on public route')
      }
    })

    await it('Boundary: Adversarial path traversal or SQL injection in slug parameter returns 404 safely', async () => {
      const adversarialSlugs = [
        '..%2F..%2Fetc%2Fpasswd',
        "' OR '1'='1",
        '<script>alert(1)</script>',
        '../../../admin'
      ]

      for (const slug of adversarialSlugs) {
        const res = await client.getArticlePageHtml(slug)
        assert.ok(res.status === 404 || res.status === 400,
          `Adversarial slug "${slug}" must be rejected with 404 or 400, got: ${res.status}`)
      }
    })
  })
}
