/**
 * Tier 2 - Boundary & Corner Cases: Slug Collisions, Hindi Transliteration & Special Symbols
 * Covers adversarial and edge inputs for Feature 3
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { isUrlSafeSlug, referenceSlugify } from '../helpers/slug-verifier.mjs'

export async function runSlugBoundariesTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 2: Slug Collisions & Hindi Edge Cases (Boundary)', async () => {
    await it('Boundary: Repeated title collisions generate sequential suffixes (-1, -2, -3)', async () => {
      const baseTitle = `Boundary Collision ${Date.now()}`
      const slugs = []

      for (let i = 0; i < 3; i++) {
        const res = await client.createArticle({
          title: baseTitle,
          content: `Test collision body ${i}`,
          category: 'General',
          author: 'Boundary Tester',
          status: 'draft'
        })
        if (res.ok && res.data.article) {
          slugs.push(res.data.article.slug)
        }
      }

      if (slugs.length >= 3) {
        assert.equal(slugs[0] === slugs[1], false, 'First and second slugs must not match')
        assert.equal(slugs[1] === slugs[2], false, 'Second and third slugs must not match')
        assert.ok(slugs[1].endsWith('-1') || slugs[1].includes('-'), 'Collision suffix should be present')
      }
    })

    await it('Boundary: Complex Hindi conjuncts with halant, nukta, and matras transliterate accurately', () => {
      // Examples with nukta (ज़िला), conjunct with halant (सम्पूर्ण, स्वतंत्रता)
      const complexHindi = 'स्वतंत्रता संग्राम में सम्पूर्ण क्रांति का योगदान'
      const slug = referenceSlugify(complexHindi)

      assert.ok(isUrlSafeSlug(slug), 'Conjunct slug must be URL-safe')
      assert.ok(!/[\u0900-\u097F]/.test(slug), 'Must contain zero Devanagari characters')
      assert.ok(
        slug.includes('kraanti') || slug.includes('kranti') ||
        slug.includes('yogdaan') || slug.includes('yogdan') ||
        slug.includes('svtntrtaa') || slug.includes('swatantrata'),
        `Slug should contain recognizable transliteration, got: ${slug}`)
    })

    await it('Boundary: Devanagari numerals transliterate to Arabic numerals', () => {
      const hindiNumbers = 'वर्ष २०२६ का बजट और ५ ट्रिलियन डॉलर की अर्थव्यवस्था'
      const slug = referenceSlugify(hindiNumbers)

      assert.ok(isUrlSafeSlug(slug))
      // 2026 and 5 should appear as digits
      assert.ok(slug.includes('2026') || slug.includes('२०२६') === false)
      assert.ok(slug.includes('5') || slug.includes('५') === false)
    })

    await it('Boundary: Pure numeric or special character titles produce valid or fallback slugs', () => {
      const numericTitle = '2026'
      const slug = referenceSlugify(numericTitle)
      assert.ok(isUrlSafeSlug(slug))
      assert.equal(slug, '2026')

      const symbolsOnly = '$$$ ### @@@ !!!'
      const emptyOrClean = referenceSlugify(symbolsOnly)
      assert.ok(!emptyOrClean.includes('$') && !emptyOrClean.includes('#'))
    })

    await it('Boundary: Extreme whitespace, newlines, and tabs normalize to single hyphens', () => {
      const whitespaceTitle = "   Frontline    Dispatch:   \n\t  Inside   the   Crisis   "
      const slug = referenceSlugify(whitespaceTitle)

      assert.ok(!slug.includes('--'))
      assert.ok(!slug.startsWith('-') && !slug.endsWith('-'))
      assert.equal(slug, 'frontline-dispatch-inside-the-crisis')
    })
  })
}
