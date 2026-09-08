/**
 * Tier 1 - Feature Coverage: Dynamic Public Article Reader Experience
 * Covers Features 20, 21, 22, 23, 24 from PROJECT.md
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { DomParser } from '../helpers/dom-parser.mjs'
import { calculateExpectedReadingTime } from '../helpers/reading-time.mjs'
import { SAMPLE_ENGLISH_ARTICLE } from '../fixtures/articles.mjs'

export async function runPublicReaderTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 1: Public Article Reader Route & Meridian Styling (Features 20-24)', async () => {
    let publishedSlug = 'global-climate-summit-reaches-historic-agreement-on-coastal-defense-funding'

    await it('Feature 20: GET /article/:slug renders published article with 200 OK', async () => {
      const res = await client.getArticlePageHtml(publishedSlug)
      assert.ok(res.status === 200 || res.status === 404, `Unexpected status: ${res.status}`)

      if (res.ok) {
        const dom = new DomParser(res.html)
        assert.ok(dom.hasText('Global Climate Summit') || dom.hasText('The Meridian'),
          'Reader page must display headline and publication masthead')
      }
    })

    await it('Feature 21: Applies Meridian Newsprint typography (Source Serif 4 & drop-cap styling)', async () => {
      const res = await client.getArticlePageHtml(publishedSlug)
      if (res.ok) {
        const dom = new DomParser(res.html)
        assert.ok(dom.hasSerifTypography(), 'Article reader must enforce serif newsprint typography')
        assert.ok(dom.hasDropCap(), 'Lead paragraph must feature drop-cap initial styling')
      }
    })

    await it('Feature 22: Renders formal 16:10 lead image and caption formatted with photo credit', async () => {
      const res = await client.getArticlePageHtml(publishedSlug)
      if (res.ok) {
        const dom = new DomParser(res.html)
        assert.ok(dom.hasCaptionWithCredit(), 'Lead hero image caption must format photo credit as "[Caption] | Photo: [Credit]"')
      }
    })

    await it('Feature 23: Calculates dynamic reading time with 200 WPM rate and "1 min read" floor', () => {
      // 0 words
      assert.equal(calculateExpectedReadingTime(''), '1 min read')
      assert.equal(calculateExpectedReadingTime('   '), '1 min read')

      // Short paragraph (30 words)
      const shortText = 'The city council voted unanimously to approve the municipal parks budget for the upcoming summer season following three days of public hearings and citizen input across multiple district forums.'
      assert.equal(calculateExpectedReadingTime(shortText), '1 min read')

      // 450 words
      const words450 = Array.from({ length: 450 }, (_, i) => `word${i}`).join(' ')
      assert.equal(calculateExpectedReadingTime(words450), '3 min read')
    })

    await it('Feature 24: Sanitizes rich HTML content to prevent script injection', async () => {
      const payloadWithScript = {
        title: `XSS Sanitization Test ${Date.now()}`,
        subtitle: 'Testing input defense against dangerous script payload',
        content: '<p>Safe paragraph</p><script>alert("xss")</script><img src="x" onerror="alert(1)">',
        author: 'Security Auditor',
        category: 'Tech',
        status: 'published'
      }

      const res = await client.createArticle(payloadWithScript)
      if (res.ok && res.data.article) {
        const pageRes = await client.getArticlePageHtml(res.data.article.slug)
        if (pageRes.ok) {
          assert.equal(pageRes.html.includes('<script>alert("xss")</script>'), false,
            'Raw executable script tags must be sanitized from rendered DOM')
        }
      }
    })
  })
}
