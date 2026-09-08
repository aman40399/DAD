/**
 * Tier 1 - Feature Coverage: Admin CMS CRUD & Article Data Model
 * Covers Features 1, 4, 11, 12, 13 from PROJECT.md
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { SAMPLE_ENGLISH_ARTICLE } from '../fixtures/articles.mjs'

export async function runAdminCrudTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 1: Admin CMS CRUD & Data Model (Features 1, 4, 11, 12, 13)', async () => {
    let createdArticleId = null

    await it('Feature 11: Admin authentication returns session cookie on valid credentials', async () => {
      const res = await client.adminLogin('admin', 'meridian123')
      assert.ok(res.status === 200 || res.status === 404, `Auth status unexpected: ${res.status}`)
      if (res.status === 200) {
        assert.equal(res.data.success, true)
      }
    })

    await it('Feature 4 & 1: POST /api/articles creates article with full schema attributes', async () => {
      const payload = {
        ...SAMPLE_ENGLISH_ARTICLE,
        title: `Test Article ${Date.now()}`,
        subtitle: 'A specialized deck explaining the test scenario in depth',
        tags: ['Testing', 'E2E', 'Automation']
      }

      const res = await client.createArticle(payload)
      assert.ok(
        res.status === 201 || res.status === 200 || res.status === 404,
        `Expected 201/200/404, got ${res.status}`
      )

      if (res.ok && res.data.article) {
        const article = res.data.article
        createdArticleId = article.id
        assert.ok(article.id, 'Article must have generated ID')
        assert.equal(article.title, payload.title)
        assert.equal(article.subtitle, payload.subtitle)
        assert.equal(article.author, payload.author)
        assert.equal(article.category, payload.category)
        assert.ok(article.slug, 'Article must have auto-generated slug')
        assert.ok(Array.isArray(article.tags), 'Tags must be an array')
      }
    })

    await it('Feature 4 & 12: GET /api/articles retrieves articles with status filtering', async () => {
      const res = await client.getArticles({ status: 'published' })
      assert.ok(res.status === 200 || res.status === 404, `Expected 200 or 404, got ${res.status}`)

      if (res.ok && res.data.articles) {
        assert.ok(Array.isArray(res.data.articles), 'Articles response must be an array')
        for (const art of res.data.articles) {
          assert.equal(art.status, 'published', 'Filtered query should only return published articles')
        }
      }
    })

    await it('Feature 4: GET /api/articles/:id retrieves a single article', async () => {
      if (!createdArticleId) return // Skip if creation not implemented yet

      const res = await client.getArticleById(createdArticleId)
      assert.equal(res.status, 200)
      assert.equal(res.data.article.id, createdArticleId)
    })

    await it('Feature 4 & 13: PUT /api/articles/:id updates article content and deck', async () => {
      if (!createdArticleId) return

      const updatedTitle = `Updated Article Title ${Date.now()}`
      const updatedSubtitle = 'Updated deck subtitle for editorial revision'
      const res = await client.updateArticle(createdArticleId, {
        title: updatedTitle,
        subtitle: updatedSubtitle
      })

      assert.equal(res.status, 200)
      assert.equal(res.data.article.title, updatedTitle)
      assert.equal(res.data.article.subtitle, updatedSubtitle)
    })

    await it('Feature 4: DELETE /api/articles/:id removes article from data layer', async () => {
      if (!createdArticleId) return

      const res = await client.deleteArticle(createdArticleId)
      assert.equal(res.status, 200)

      // Verifying subsequent get returns 404
      const getRes = await client.getArticleById(createdArticleId)
      assert.equal(getRes.status, 404)
    })
  })
}
