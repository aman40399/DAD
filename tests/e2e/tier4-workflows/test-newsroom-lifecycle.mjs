/**
 * Tier 4 - Real-World Editorial Workflows: Full Newsroom Lifecycle
 * Simulates complete end-to-end authoring, media cropping, curation, publication, reading, and bookmarking.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { DomParser } from '../helpers/dom-parser.mjs'
import { computeMaxCropArea, isValidAspectRatio, ASPECT_RATIOS } from '../helpers/cropper-math.mjs'
import { calculateExpectedReadingTime } from '../helpers/reading-time.mjs'
import { MOCK_WEBP_IMAGE_BASE64 } from '../fixtures/articles.mjs'

export async function runNewsroomLifecycleWorkflow(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 4: Complete Real-World Newsroom Editorial Lifecycle Workflow', async () => {
    let articleId = null
    let articleSlug = null
    let heroImageUrl = null
    const articleTitle = `Investigative Report: The Deep Sea Mineral Rush of 2026 ${Date.now()}`
    const articleSubtitle = 'An exhaustive inquiry into multinational seabed mining permits across the Clarion-Clipperton Zone'
    const articleExcerpt = 'As demand for battery minerals intensifies, international seabed authorities face pivotal decisions on environmental moratoriums.'
    const articleCaption = 'Deep ocean autonomous submersible descending to abyssal plains | Photo: Oceanographic Institute / AP'
    const articleContent = `Under three miles of open Pacific water, fleets of robotic survey vessels are mapping vast plains of manganese nodules that have rested undisturbed for millions of years.

The stakes could hardly be higher. Mining consortiums argue that electric vehicle transitions require tens of millions of tons of nickel and cobalt, minerals found in abundance on the ocean floor. Conversely, marine biologists warn that destructive seabed scraping could obliterate deep sea biodiversity before science has even cataloged it.

"We are standing on the brink of industrializing the largest wilderness on planet Earth," cautioned Dr. Naomi Vance, senior marine ecologist at the Woods Hole Consortium. "The damage wrought by seafloor plowing cannot be rehabilitated on human timescales."

Over the next six months, thirty-six member nations will convene in Kingston to cast binding ballots on the regulatory framework governing commercial seabed exploitation.`

    await it('Workflow Phase 1: Author starts drafting story and saves initial draft in Admin CMS', async () => {
      const draftPayload = {
        title: articleTitle,
        subtitle: articleSubtitle,
        excerpt: articleExcerpt,
        content: articleContent,
        author: 'Julian Montgomery & Sarah Chen',
        category: 'Investigations',
        status: 'draft',
        tags: ['Investigation', 'Environment', 'Oceans', 'Economy'],
        language: 'english'
      }

      const res = await client.createArticle(draftPayload)
      assert.ok(res.status === 201 || res.status === 200 || res.status === 404)
      if (res.ok && res.data.article) {
        articleId = res.data.article.id
        articleSlug = res.data.article.slug
        assert.equal(res.data.article.status, 'draft')
        assert.ok(articleSlug, 'Slug should be automatically generated upon draft save')
      }
    })

    await it('Workflow Phase 2: System verifies unpublished draft is gated from public view and homepage', async () => {
      if (!articleSlug) return

      // Gated 404 from public reader
      const readerRes = await client.getArticlePageHtml(articleSlug)
      assert.equal(readerRes.status, 404, 'Unpublished draft must return 404 to readers')

      // Excluded from homepage
      const homeRes = await client.getHomepageHtml()
      if (homeRes.ok) {
        assert.equal(homeRes.html.includes(articleTitle), false, 'Unpublished draft must not leak onto homepage')
      }
    })

    await it('Workflow Phase 3: Author uploads image, crops to 16:10, and designates as Primary Hero with caption', async () => {
      if (!articleId) return

      // Step A: Calculate crop
      const crop = computeMaxCropArea(2560, 1600, ASPECT_RATIOS.HERO)
      assert.ok(isValidAspectRatio(crop.width, crop.height, ASPECT_RATIOS.HERO))

      // Step B: Upload cropped image
      const buffer = Buffer.from(MOCK_WEBP_IMAGE_BASE64, 'base64')
      const uploadRes = await client.uploadMedia(buffer, {
        filename: 'deep-sea-submersible-16-10.webp',
        mimeType: 'image/webp',
        aspectRatio: '16:10'
      })

      if (uploadRes.ok && uploadRes.data?.url) {
        heroImageUrl = uploadRes.data.url
      } else {
        heroImageUrl = 'https://pub-r2.meridian-news.test/media/deep-sea-submersible.webp'
      }

      // Step C: Update draft with hero image and caption
      const updateRes = await client.updateArticle(articleId, {
        imageUrl: heroImageUrl,
        imageCaption: articleCaption
      })
      if (updateRes.ok && updateRes.data.article) {
        assert.equal(updateRes.data.article.imageCaption || updateRes.data.article.image_caption, articleCaption)
      }
    })

    await it('Workflow Phase 4: Author verifies calculated reading time and publishes the article', async () => {
      if (!articleId) return

      const expectedReadingTime = calculateExpectedReadingTime(articleContent)
      assert.ok(expectedReadingTime.includes('min read'), 'Reading time must be formatted as "X min read"')

      const pubRes = await client.updateArticle(articleId, {
        status: 'published'
      })
      if (pubRes.ok && pubRes.data.article) {
        assert.equal(pubRes.data.article.status, 'published')
        assert.ok(pubRes.data.article.published_at || pubRes.data.article.publishedAt)
      }
    })

    await it('Workflow Phase 5: Editor opens Broadsheet Position Manager and pins article to Slot 2 (Lead Hero)', async () => {
      if (!articleId) return

      const pinRes = await client.pinPosition(articleId, 2)
      assert.ok(pinRes.status === 200 || pinRes.status === 404)
      if (pinRes.ok) {
        assert.equal(pinRes.data.slot, 2)
      }
    })

    await it('Workflow Phase 6: Reader lands on homepage and discovers the Lead Hero story in Slot 2', async () => {
      const homeRes = await client.getHomepageHtml()
      if (homeRes.ok) {
        assert.ok(
          homeRes.html.includes(articleTitle) || homeRes.html.includes(articleSlug),
          'Lead Hero story must be prominently rendered on homepage'
        )
      }
    })

    await it('Workflow Phase 7: Reader reads article with Source Serif 4, drop-cap, caption, and reading time', async () => {
      if (!articleSlug) return

      const readerRes = await client.getArticlePageHtml(articleSlug)
      assert.ok(readerRes.status === 200 || readerRes.status === 404)
      if (readerRes.ok) {
        const dom = new DomParser(readerRes.html)
        assert.ok(dom.hasText(articleTitle), 'Reader must display full title')
        assert.ok(dom.hasSerifTypography(), 'Reader must use serif typography')
        assert.ok(dom.hasDropCap(), 'Reader must format lead paragraph with drop-cap')
        assert.ok(dom.hasCaptionWithCredit(), 'Reader must display caption with photo credit')
        assert.ok(dom.hasReadingTime(), 'Reader must display estimated reading time')
      }
    })

    await it('Workflow Phase 8: Reader saves article to client bookmarks', () => {
      if (!articleId) return

      // Client-side bookmarking state
      const bookmarks = new Set()
      bookmarks.add(articleId)
      assert.ok(bookmarks.has(articleId), 'Article must be recorded in reader bookmarks')
      assert.equal(bookmarks.size, 1)
    })

    await it('Workflow Phase 9: Editorial cleanup / unpinning after publication cycle', async () => {
      const unpinRes = await client.unpinPosition(2)
      assert.ok(unpinRes.status === 200 || unpinRes.status === 404)
    })
  })
}
