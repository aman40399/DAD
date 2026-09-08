/**
 * Tier 2 - Boundary & Corner Cases: Media Fallbacks, MIME Validation & Extreme Crops
 * Covers edge cases for Features 6, 7, 8, 9
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MeridianApiClient } from '../helpers/api-client.mjs'
import { computeMaxCropArea, isCropWithinBounds, isValidAspectRatio, ASPECT_RATIOS } from '../helpers/cropper-math.mjs'

export async function runMediaFallbacksBoundariesTests(baseUrl) {
  const client = new MeridianApiClient(baseUrl)

  await describe('Tier 2: Media Fallbacks & Extreme Dimensions (Boundary)', async () => {
    await it('Boundary: POST /api/media/upload rejects non-image MIME types', async () => {
      const textBuffer = Buffer.from('This is an ordinary text file, not an image')
      const res = await client.uploadMedia(textBuffer, {
        filename: 'document.txt',
        mimeType: 'text/plain',
        aspectRatio: '16:10'
      })

      // Must be rejected or handled gracefully
      assert.ok(res.status === 400 || res.status === 415 || res.status === 422 || res.status === 404,
        `Expected rejection of non-image MIME, got: ${res.status}`)
    })

    await it('Boundary: Rejects empty or 0-byte file upload payload', async () => {
      const emptyBuffer = Buffer.alloc(0)
      const res = await client.uploadMedia(emptyBuffer, {
        filename: 'empty.webp',
        mimeType: 'image/webp'
      })

      assert.ok(res.status === 400 || res.status === 422 || res.status === 404,
        `Empty buffer should be rejected, got: ${res.status}`)
    })

    await it('Boundary: Cropper handles extreme aspect ratios without out-of-bounds coords', () => {
      // Super wide panorama: 4000x500
      const wideCrop = computeMaxCropArea(4000, 500, ASPECT_RATIOS.HERO)
      assert.ok(isCropWithinBounds(wideCrop, 4000, 500), 'Super wide crop must be within bounds')
      assert.ok(isValidAspectRatio(wideCrop.width, wideCrop.height, ASPECT_RATIOS.HERO))
      assert.equal(wideCrop.height, 500)
      assert.equal(wideCrop.width, 800)

      // Super tall portrait: 500x4000
      const tallCrop = computeMaxCropArea(500, 4000, ASPECT_RATIOS.HERO)
      assert.ok(isCropWithinBounds(tallCrop, 500, 4000), 'Super tall crop must be within bounds')
      assert.ok(isValidAspectRatio(tallCrop.width, tallCrop.height, ASPECT_RATIOS.HERO))
      assert.equal(tallCrop.width, 500)
      assert.equal(tallCrop.height, 313) // 500 / 1.6 = 312.5 -> 313
    })

    await it('Boundary: Cropper throws descriptive error on invalid zero or negative dimensions', () => {
      assert.throws(() => computeMaxCropArea(0, 100, ASPECT_RATIOS.HERO), /Invalid source dimensions/)
      assert.throws(() => computeMaxCropArea(100, -5, ASPECT_RATIOS.HERO), /Invalid source dimensions/)
    })
  })
}
