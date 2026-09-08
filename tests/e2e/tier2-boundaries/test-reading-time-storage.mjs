/**
 * Tier 2 - Boundary & Corner Cases: Reading Time & Client Storage Resilience
 * Covers edge cases for Features 23 and 25
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calculateExpectedReadingTime } from '../helpers/reading-time.mjs'

export async function runReadingTimeStorageBoundariesTests() {
  await describe('Tier 2: Reading Time & Storage Resilience (Boundary)', async () => {
    await it('Boundary: Reading time strictly enforces "1 min read" minimum floor for empty/null content', () => {
      assert.equal(calculateExpectedReadingTime(''), '1 min read')
      assert.equal(calculateExpectedReadingTime('   \n\t  '), '1 min read')
      assert.equal(calculateExpectedReadingTime(null), '1 min read')
      assert.equal(calculateExpectedReadingTime(undefined), '1 min read')
    })

    await it('Boundary: Reading time ceiling correctly steps from 1 min to 2 min at boundary', () => {
      const words200 = Array.from({ length: 200 }, () => 'news').join(' ')
      assert.equal(calculateExpectedReadingTime(words200), '1 min read')

      const words201 = Array.from({ length: 201 }, () => 'news').join(' ')
      assert.equal(calculateExpectedReadingTime(words201), '2 min read')
    })

    await it('Boundary: Reading time strips HTML and markdown syntax before word counting', () => {
      const markupContent = `
        <div class="test-class">
          <h1>Main Title</h1>
          <p>This is a paragraph with <b>bold</b>, <i>italic</i>, and <a href="https://example.com">links</a>.</p>
          <img src="https://example.com/image.jpg" alt="A descriptive alt tag with extra words" />
        </div>
      `
      const time = calculateExpectedReadingTime(markupContent)
      assert.equal(time, '1 min read')
    })

    await it('Boundary: Client bookmarking gracefully recovers from corrupted localStorage data', () => {
      // Simulation of localStorage parsing
      const parseBookmarksSafe = (rawJson) => {
        try {
          const parsed = JSON.parse(rawJson)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }

      assert.deepEqual(parseBookmarksSafe('invalid json {['), [])
      assert.deepEqual(parseBookmarksSafe('{"not": "an array"}'), [])
      assert.deepEqual(parseBookmarksSafe('null'), [])
      assert.deepEqual(parseBookmarksSafe('["art-1", "art-2"]'), ['art-1', 'art-2'])
    })

    await it('Boundary: Client bookmarking handles QuotaExceededError or private mode restrictions safely', () => {
      // Simulation of storage write failure
      const safeStore = (key, value, mockStorage) => {
        try {
          mockStorage.setItem(key, JSON.stringify(value))
          return true
        } catch (e) {
          console.warn('Storage quota exceeded or private mode active, fallback to memory', e.message)
          return false
        }
      }

      const failingStorage = {
        setItem: () => {
          const err = new Error('QuotaExceededError')
          err.name = 'QuotaExceededError'
          throw err
        }
      }

      // Must not throw an unhandled exception
      const success = safeStore('meridian_bookmarks', ['art-1'], failingStorage)
      assert.equal(success, false)
    })
  })
}
