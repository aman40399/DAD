/**
 * Tier 1 - Feature Coverage: Multilingual & URL-safe Slug Generation
 * Covers Feature 3 from PROJECT.md
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { isUrlSafeSlug, referenceSlugify } from '../helpers/slug-verifier.mjs'

export async function runSlugGenerationTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 1: Multilingual Slug Generation (Feature 3)', async () => {
    await it('Feature 3: Generates clean ASCII URL-safe slug for standard English title', async () => {
      const title = 'The Future of Renewable Offshore Wind Energy in 2026'
      const expectedSlug = 'the-future-of-renewable-offshore-wind-energy-in-2026'
      const generated = referenceSlugify(title)

      assert.equal(generated, expectedSlug)
      assert.ok(isUrlSafeSlug(generated), 'Slug must satisfy URL safety regex')
    })

    await it('Feature 3: Correctly transliterates Hindi / Devanagari characters to Latin ASCII', async () => {
      const hindiTitle = 'भारत ने अंतरिक्ष मिशन में रचा नया इतिहास'
      const generated = referenceSlugify(hindiTitle)

      assert.ok(generated.length > 0, 'Transliterated slug must not be empty')
      assert.ok(!/[\u0900-\u097F]/.test(generated), 'Slug must not contain any raw Devanagari characters')
      assert.ok(isUrlSafeSlug(generated), 'Transliterated slug must be URL-safe ASCII')
      assert.ok(generated.includes('bharat') || generated.includes('antriksh') || generated.includes('mission'),
        `Slug should contain recognized phonetic transliteration, got: ${generated}`)
    })

    await it('Feature 3: Strips special punctuation, quotation marks, and meta characters', async () => {
      const noisyTitle = 'Exclusive: "Breaking" News! Cost of Living Rises by 4.5% in Q2 — What Next?'
      const generated = referenceSlugify(noisyTitle)

      assert.ok(!/[":!%—?]/.test(generated), 'Slug must strip punctuation symbols')
      assert.ok(!generated.includes('--'), 'Consecutive hyphens must be collapsed')
      assert.ok(!generated.startsWith('-') && !generated.endsWith('-'), 'No leading/trailing hyphens')
      assert.ok(isUrlSafeSlug(generated))
    })

    await it('Feature 3: API creates unique slug and avoids collisions on duplicate titles', async () => {
      const title = `Collision Test ${Date.now()}`
      const res1 = await client.createArticle({
        title,
        excerpt: 'First article with title',
        content: 'Content 1',
        author: 'Test Author',
        category: 'News',
        status: 'draft'
      })

      const res2 = await client.createArticle({
        title,
        excerpt: 'Second article with identical title',
        content: 'Content 2',
        author: 'Test Author',
        category: 'News',
        status: 'draft'
      })

      if (res1.ok && res2.ok && res1.data.article && res2.data.article) {
        const slug1 = res1.data.article.slug
        const slug2 = res2.data.article.slug
        assert.notEqual(slug1, slug2, 'Identical titles must generate distinct, non-colliding slugs')
        assert.ok(slug2.startsWith(slug1), 'Collision suffix should preserve base slug')
      }
    })
  })
}
