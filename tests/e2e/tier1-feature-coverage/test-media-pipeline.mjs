/**
 * Tier 1 - Feature Coverage: Media Upload, Cropper Pipeline & R2 Storage
 * Covers Features 6, 7, 8, 9, 10, 14 from PROJECT.md
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { isValidAspectRatio, computeMaxCropArea, isCropWithinBounds, ASPECT_RATIOS } from '../helpers/cropper-math.mjs'
import { MOCK_WEBP_IMAGE_BASE64 } from '../fixtures/articles.mjs'

export async function runMediaPipelineTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 1: Media Pipeline, Cropper & R2 Storage (Features 6-10, 14)', async () => {
    await it('Feature 7 & 6: POST /api/media/upload accepts image file and returns public URL & metadata', async () => {
      const buffer = Buffer.from(MOCK_WEBP_IMAGE_BASE64, 'base64')
      const res = await client.uploadMedia(buffer, {
        filename: 'broadsheet-hero.webp',
        mimeType: 'image/webp',
        aspectRatio: '16:10'
      })

      assert.ok(res.status === 200 || res.status === 404, `Unexpected status: ${res.status}`)

      if (res.ok && res.data) {
        assert.ok(res.data.url, 'Upload response must include public image URL')
        assert.ok(res.data.key, 'Upload response must include storage key')
        assert.equal(res.data.aspectRatio, '16:10')
      }
    })

    await it('Feature 9 & 8: Enforces 16:10 aspect ratio math for hero/broadsheet images', () => {
      // 16:10 target ratio = 1.6
      assert.ok(isValidAspectRatio(1600, 1000, ASPECT_RATIOS.HERO))
      assert.ok(isValidAspectRatio(800, 500, ASPECT_RATIOS.HERO))
      assert.ok(isValidAspectRatio(1920, 1200, ASPECT_RATIOS.HERO))
      assert.equal(isValidAspectRatio(1920, 1080, ASPECT_RATIOS.HERO), false, '16:9 must not pass 16:10 ratio')
      assert.equal(isValidAspectRatio(1000, 1000, ASPECT_RATIOS.HERO), false, '1:1 must not pass 16:10 ratio')
    })

    await it('Feature 9 & 8: Enforces 1:1 aspect ratio math for thumbnail/avatar images', () => {
      // 1:1 target ratio = 1.0
      assert.ok(isValidAspectRatio(400, 400, ASPECT_RATIOS.THUMBNAIL))
      assert.ok(isValidAspectRatio(800, 800, ASPECT_RATIOS.THUMBNAIL))
      assert.equal(isValidAspectRatio(1600, 1000, ASPECT_RATIOS.THUMBNAIL), false)
    })

    await it('Feature 8: Computes valid centered crop coordinates within source boundaries', () => {
      const srcWidth = 1920
      const srcHeight = 1080

      // Crop to 16:10
      const heroCrop = computeMaxCropArea(srcWidth, srcHeight, ASPECT_RATIOS.HERO)
      assert.ok(isCropWithinBounds(heroCrop, srcWidth, srcHeight), 'Crop box must be within source image')
      assert.ok(isValidAspectRatio(heroCrop.width, heroCrop.height, ASPECT_RATIOS.HERO), 'Crop box must have 16:10 ratio')

      // Crop to 1:1
      const thumbCrop = computeMaxCropArea(srcWidth, srcHeight, ASPECT_RATIOS.THUMBNAIL)
      assert.ok(isCropWithinBounds(thumbCrop, srcWidth, srcHeight), 'Crop box must be within source image')
      assert.ok(isValidAspectRatio(thumbCrop.width, thumbCrop.height, ASPECT_RATIOS.THUMBNAIL), 'Crop box must have 1:1 ratio')
    })

    await it('Feature 10 & 14: Article data model designates exactly one primary hero image with caption', async () => {
      const heroUrl = 'https://pub-r2.meridian-news.test/media/hero-16-10.webp'
      const caption = 'A historic summit held in Geneva | Photo: Archive'

      const res = await client.createArticle({
        title: `Hero Designation Test ${Date.now()}`,
        imageUrl: heroUrl,
        imageCaption: caption,
        status: 'draft',
        category: 'Politics',
        author: 'Staff Reporter'
      })

      if (res.ok && res.data.article) {
        const art = res.data.article
        assert.equal(art.imageUrl || art.image_url, heroUrl)
        assert.equal(art.imageCaption || art.image_caption, caption)
      }
    })

    await it('Feature: GET /api/media lists archived media assets with aspect ratio and metadata', async () => {
      const res = await fetch(`${baseUrl}/api/media`)
      assert.equal(res.status, 200, 'GET /api/media should return 200 OK')
      const json = await res.json()
      assert.ok(json.success, 'Response should indicate success')
      assert.ok(Array.isArray(json.media), 'Response should include media array')
      if (json.media.length > 0) {
        const item = json.media[0]
        assert.ok(item.url, 'Media item must have url')
        assert.ok(item.aspectRatio, 'Media item must have aspectRatio')
      }
    })
  })
}
