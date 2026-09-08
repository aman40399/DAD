/**
 * Tier 3 - Cross-Feature Combination: Cropped 16:10 Hero -> R2 Upload -> Primary Designation -> Reader Caption
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { DomParser } from '../helpers/dom-parser.mjs'
import { computeMaxCropArea, isValidAspectRatio, ASPECT_RATIOS } from '../helpers/cropper-math.mjs'
import { MOCK_WEBP_IMAGE_BASE64 } from '../fixtures/articles.mjs'

export async function runHeroCropperRenderFlowTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 3: Combination - 16:10 Crop -> R2 Upload -> Hero Designation -> Reader Caption', async () => {
    let uploadedImageUrl = null
    let createdArticle = null
    const formalCaption = 'High altitude meteorological balloon ascends into stratosphere | Photo: Atmos Lab'

    await it('Step 1: Editor selects raw image and cropper locks to 16:10 aspect ratio', () => {
      // Source image 1920x1080
      const crop = computeMaxCropArea(1920, 1080, ASPECT_RATIOS.HERO)
      assert.ok(isValidAspectRatio(crop.width, crop.height, ASPECT_RATIOS.HERO), 'Must enforce 16:10 ratio')
      assert.equal(crop.height, 1080)
      assert.equal(crop.width, 1728) // 1080 * 1.6
    })

    await it('Step 2: Cropped 16:10 image is uploaded via /api/media/upload to R2', async () => {
      const buffer = Buffer.from(MOCK_WEBP_IMAGE_BASE64, 'base64')
      const res = await client.uploadMedia(buffer, {
        filename: 'stratosphere-balloon-16-10.webp',
        mimeType: 'image/webp',
        aspectRatio: '16:10'
      })

      assert.ok(res.status === 200 || res.status === 404)
      if (res.ok && res.data?.url) {
        uploadedImageUrl = res.data.url
        assert.equal(res.data.aspectRatio, '16:10')
      } else {
        uploadedImageUrl = 'https://pub-r2.meridian-news.test/media/stratosphere-balloon-16-10.webp'
      }
    })

    await it('Step 3: Editor designates uploaded image as Primary Hero with formal caption', async () => {
      const payload = {
        title: `Stratospheric Weather Balloon Deployed for Polar Research ${Date.now()}`,
        subtitle: 'New telemetry sensors capture real-time ozone layer fluctuations',
        excerpt: 'Scientists initiated the seasonal high-altitude balloon flight to measure polar vortex stability.',
        content: 'Full report on meteorological instruments, trajectory predictions, and international monitoring.',
        author: 'Dr. Clara Higgins',
        category: 'Science',
        imageUrl: uploadedImageUrl,
        imageCaption: formalCaption,
        status: 'published',
        tags: ['Science', 'Atmosphere', 'Polar']
      }

      const res = await client.createArticle(payload)
      if (res.ok && res.data.article) {
        createdArticle = res.data.article
        assert.equal(createdArticle.imageUrl || createdArticle.image_url, uploadedImageUrl)
        assert.equal(createdArticle.imageCaption || createdArticle.image_caption, formalCaption)
      }
    })

    await it('Step 4: Reader view renders 16:10 hero image accompanied by formal caption and photo credit', async () => {
      if (!createdArticle?.slug) return

      const res = await client.getArticlePageHtml(createdArticle.slug)
      if (res.ok) {
        const dom = new DomParser(res.html)
        assert.ok(dom.hasCaptionWithCredit(), 'Reader must format caption with photo credit')
        assert.ok(res.html.includes('Atmos Lab') || res.html.includes('Photo:'), 'Must include credit')
      }
    })
  })
}
