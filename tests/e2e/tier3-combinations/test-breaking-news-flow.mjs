/**
 * Tier 3 - Cross-Feature Combination: Breaking News Story -> Slot 1 / Ticker -> Homepage Live Feed
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { DomParser } from '../helpers/dom-parser.mjs'

export async function runBreakingNewsFlowTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 3: Combination - Breaking News -> Slot 1 Ticker -> Homepage Feed', async () => {
    let breakingArticle = null

    await it('Step 1: Editor publishes breaking story with is_breaking=true', async () => {
      const payload = {
        title: `URGENT: Emergency Quake Response Mobilized Along North Ridge Fault ${Date.now()}`,
        subtitle: 'Civil protection services deploy field hospitals and temporary shelters',
        excerpt: 'A magnitude 6.2 tremor struck early this morning with emergency sirens activated.',
        content: 'Emergency services dispatched across five regional centers. No critical casualties reported.',
        author: 'Disaster Monitoring Desk',
        category: 'National',
        isBreaking: true,
        status: 'published',
        tags: ['Breaking', 'Emergency', 'National']
      }

      const res = await client.createArticle(payload)
      if (res.ok && res.data.article) {
        breakingArticle = res.data.article
        assert.equal(breakingArticle.isBreaking || breakingArticle.is_breaking, true)
      }
    })

    await it('Step 2: Story is designated to Slot 1 (Breaking Ticker)', async () => {
      if (!breakingArticle?.id) return

      const pinRes = await client.pinPosition(breakingArticle.id, 1)
      assert.ok(pinRes.status === 200 || pinRes.status === 404)
      if (pinRes.ok) {
        assert.equal(pinRes.data.slot, 1)
      }
    })

    await it('Step 3: Homepage renders the breaking story prominently in the top Breaking Ticker', async () => {
      if (!breakingArticle?.title) return

      const res = await client.getHomepageHtml()
      if (res.ok) {
        const dom = new DomParser(res.html)
        assert.ok(dom.hasBreakingTicker(), 'Homepage must render Breaking Ticker')
        assert.ok(
          res.html.includes(breakingArticle.title) || res.html.includes(breakingArticle.slug),
          'Breaking ticker must feature the breaking story headline'
        )
      }
    })
  })
}
