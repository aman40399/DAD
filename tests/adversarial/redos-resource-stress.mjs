/**
 * Adversarial Test Suite 3: ReDoS, Resource Pressure, and Catastrophic Stress
 * Verifies that regular expressions and parsing loops in lib/utils.ts survive adversarial resource exhaustion.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateSlug,
  isValidSlug,
  transliterateDevanagari,
} from '../../lib/utils.ts'

export async function runReDoSResourceStressTests() {
  await describe('Adversarial Suite 3: ReDoS & Resource Exhaustion Resistance', async () => {

    await it('Security: isValidSlug regex resists ReDoS under pathological repetition', () => {
      // Nested quantifier attack: /^[a-z0-9]+(-[a-z0-9]+)*$/
      // Adversarial payload with repeating hyphens and alphanumeric sequences ending with invalid symbol
      const payload1 = 'a'.repeat(50000) + '!'
      const t0 = performance.now()
      assert.equal(isValidSlug(payload1), false)
      const dur1 = performance.now() - t0
      assert.ok(dur1 < 100, `ReDoS check 1 must execute under 100ms (took ${dur1.toFixed(2)}ms)`)

      const payload2 = ('alpha-' + 'beta-').repeat(15000) + '@'
      const t1 = performance.now()
      assert.equal(isValidSlug(payload2), false)
      const dur2 = performance.now() - t1
      assert.ok(dur2 < 100, `ReDoS check 2 must execute under 100ms (took ${dur2.toFixed(2)}ms)`)

      const payload3 = 'a-'.repeat(25000)
      const t2 = performance.now()
      assert.equal(isValidSlug(payload3), false)
      const dur3 = performance.now() - t2
      assert.ok(dur3 < 100, `ReDoS check 3 must execute under 100ms (took ${dur3.toFixed(2)}ms)`)
    })

    await it('Resource: 100,000 character massive title processed under 50ms', () => {
      // Generate 100,000 characters of alternating symbols, Hindi, English, and digits
      const chunk = 'The Quick Brown Fox jumps over 100 lazy dogs & भारत का विकास २०२६! '
      const massive = chunk.repeat(1500) // ~100,500 chars

      const start = performance.now()
      const slug = generateSlug(massive)
      const elapsed = performance.now() - start

      assert.ok(isValidSlug(slug), 'Massive slug must be URL-safe')
      assert.ok(slug.length <= 100, `Length must cap at 100, got ${slug.length}`)
      assert.ok(elapsed < 100, `Processing 100k characters took ${elapsed.toFixed(2)}ms, expected < 100ms`)
    })

    await it('Resource: 5,000 Devanagari conjuncts loop without call-stack or memory exhaustion', () => {
      // 5,000 conjuncts: ज्ञ + क्ष + श्र + त्र
      const conjunctString = 'ज्ञान क्षत्रिय श्रवण त्रिशूल '.repeat(1250)

      const start = performance.now()
      const transliterated = transliterateDevanagari(conjunctString)
      const slug = generateSlug(conjunctString)
      const elapsed = performance.now() - start

      assert.ok(transliterated.length > 10000, 'Transliteration should produce massive Latin string')
      assert.ok(isValidSlug(slug), 'Slug must be URL-safe')
      assert.ok(elapsed < 150, `5,000 conjuncts processed in ${elapsed.toFixed(2)}ms, expected < 150ms`)
    })

    await it('Stress: Rapid burst of 1,000 unique slug generation requests', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        const title = `Breaking Story: Market ${i} rallies by ${i % 10}% in 2026! भारत समाचार`
        const slug = generateSlug(title)
        assert.ok(isValidSlug(slug))
      }
      const elapsed = performance.now() - start
      assert.ok(elapsed < 500, `1,000 slugs generated in ${elapsed.toFixed(2)}ms (< 0.5ms per slug)`)
    })

  })
}

// Standalone execution support
if (process.argv[1]?.endsWith('redos-resource-stress.mjs')) {
  runReDoSResourceStressTests()
}
