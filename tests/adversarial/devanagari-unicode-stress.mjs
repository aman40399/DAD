/**
 * Adversarial Test Suite 1: Devanagari Transliteration, Unicode Stress, and Edge Cases
 * Tests lib/utils.ts against extreme linguistic, structural, and Unicode inputs.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateSlug,
  isValidSlug,
  transliterateDevanagari,
} from '../../lib/utils.ts'

export async function runDevanagariUnicodeStressTests() {
  await describe('Adversarial Suite 1: Devanagari Transliteration & Unicode Stress', async () => {
    
    // -------------------------------------------------------------
    // 1. Standalone Matras (Vowel Signs without Consonants)
    // -------------------------------------------------------------
    await it('Linguistic: Standalone matras generate valid non-empty ASCII slugs', () => {
      const matras = [
        { char: 'ा', name: 'aa matra' },
        { char: 'ि', name: 'i matra' },
        { char: 'ी', name: 'ee matra' },
        { char: 'ु', name: 'u matra' },
        { char: 'ू', name: 'oo matra' },
        { char: 'ृ', name: 'ri matra' },
        { char: 'ॄ', name: 'vocalic rr matra' },
        { char: 'े', name: 'e matra' },
        { char: 'ै', name: 'ai matra' },
        { char: 'ो', name: 'o matra' },
        { char: 'ौ', name: 'au matra' },
        { char: 'ॉ', name: 'candra o matra' },
        { char: 'ॅ', name: 'candra e matra' },
        { char: 'ॆ', name: 'short e matra' },
        { char: 'ॊ', name: 'short o matra' },
      ]

      for (const { char, name } of matras) {
        const slug = generateSlug(char)
        assert.ok(isValidSlug(slug), `Matra ${name} (${char}) must produce a valid slug, got "${slug}"`)
        assert.ok(!/[\u0900-\u097F]/.test(slug), `Slug for ${name} must not contain Devanagari`)
      }
    })

    await it('Linguistic: Sequences of successive matras without consonants', () => {
      const successive = ['ािुे', 'ोौैे', 'ृॄाी']
      for (const seq of successive) {
        const slug = generateSlug(seq)
        assert.ok(isValidSlug(slug), `Successive matras "${seq}" must produce valid slug: got "${slug}"`)
        assert.ok(!/[\u0900-\u097F]/.test(slug), `Must contain no Devanagari`)
      }
    })

    await it('Linguistic: Multiple matras stacked on single consonant (ill-formed Unicode)', () => {
      const illFormed = ['किा', 'काे', 'कौेि', 'मीाु']
      for (const text of illFormed) {
        const slug = generateSlug(text)
        assert.ok(isValidSlug(slug), `Ill-formed "${text}" must produce valid slug: got "${slug}"`)
        assert.ok(!/[\u0900-\u097F]/.test(slug), `Must contain no Devanagari`)
      }
    })

    // -------------------------------------------------------------
    // 2. Modifiers, Diacritics, Accents, and Punctuation
    // -------------------------------------------------------------
    await it('Linguistic: Standalone modifiers and Vedic accents handle gracefully', () => {
      const standalone = [
        { char: '्', name: 'halant alone' },
        { char: '़', name: 'nukta alone' },
        { char: 'ं', name: 'anusvara alone' },
        { char: 'ँ', name: 'candrabindu alone' },
        { char: 'ः', name: 'visarga alone' },
        { char: 'ऽ', name: 'avagraha alone' },
        { char: 'ॐ', name: 'om sign alone' },
        { char: '।', name: 'danda alone' },
        { char: '॥', name: 'double danda alone' },
        { char: '॰', name: 'abbreviation sign alone' },
      ]

      for (const { char, name } of standalone) {
        const slug = generateSlug(char)
        assert.ok(isValidSlug(slug), `Modifier ${name} (${char}) must produce valid slug: got "${slug}"`)
        assert.ok(!/[\u0900-\u097F]/.test(slug), `Modifier ${name} must contain no Devanagari`)
      }
    })

    await it('Linguistic: Trailing halants in formal Hindi/Sanskrit words', () => {
      const wordsWithTrailingHalant = [
        { input: 'संसद्', expectedStem: 'sansad' },
        { input: 'महान् व्यक्ति', expectedStem: 'mahaan' },
        { input: 'विद्वान् शोधकर्ता', expectedStem: 'vidvaan' },
        { input: 'परिषद् बैठक', expectedStem: 'parishad' },
        { input: 'अर्थात् नया कानून', expectedStem: 'arthaat' },
        { input: 'एवम् अन्य मुद्दे', expectedStem: 'evam' },
      ]

      for (const { input, expectedStem } of wordsWithTrailingHalant) {
        const slug = generateSlug(input)
        assert.ok(isValidSlug(slug), `Trailing halant "${input}" must produce valid slug: got "${slug}"`)
        assert.ok(!slug.startsWith('-') && !slug.endsWith('-'), `Must not have leading/trailing hyphens`)
        assert.ok(!slug.includes('--'), `Must not have consecutive hyphens`)
        assert.ok(!/[\u0900-\u097F]/.test(slug), `Must contain no Devanagari`)
      }
    })

    // -------------------------------------------------------------
    // 3. Zero-Width Joiners (ZWJ) and Non-Joiners (ZWNJ)
    // -------------------------------------------------------------
    await it('Unicode Stress: Zero-Width Joiners (ZWJ / ZWNJ) within words and conjuncts', () => {
      const zwjCases = [
        { text: 'क्\u200Dव', name: 'Half ka with ZWJ' },
        { text: 'क्\u200Cत', name: 'Ka with explicit halant and ZWNJ' },
        { text: 'र्\u200Dया', name: 'Eyelash Ra with ZWJ' },
        { text: 'र्\u200Dह', name: 'Eyelash Ra with ha' },
        { text: 'भारत\u200Dजोड़ो', name: 'ZWJ between words' },
        { text: 'भारत\u200Cजोड़ो', name: 'ZWNJ between words' },
        { text: '\u200D\u200C\u200D\u200C', name: 'Only ZWJ and ZWNJ' },
        { text: 'समाचार\u200D\u200D\u200D२०२६', name: 'Multiple consecutive ZWJs' },
      ]

      for (const { text, name } of zwjCases) {
        const slug = generateSlug(text)
        assert.ok(isValidSlug(slug), `Case "${name}" must produce valid slug: got "${slug}"`)
        assert.ok(!slug.includes('\u200D'), `Must not contain unstripped ZWJ`)
        assert.ok(!slug.includes('\u200C'), `Must not contain unstripped ZWNJ`)
        assert.ok(!/[\u0900-\u097F]/.test(slug), `Must contain no Devanagari`)
      }
    })

    // -------------------------------------------------------------
    // 4. Complex & Multi-Consonant Conjunct Clusters
    // -------------------------------------------------------------
    await it('Linguistic: Complex multi-consonant Sanskrit/Hindi conjunct clusters', () => {
      const conjuncts = [
        { text: 'ज्ञान और विज्ञान की शक्ति', contains: ['gyaan', 'vigyaan'] },
        { text: 'क्षत्रिय धर्म और मर्यादा', contains: ['kshatriy'] },
        { text: 'श्री राम और श्रवण कुमार', contains: ['shree', 'shravan'] },
        { text: 'त्रिशूल और त्रिभुज का रहस्य', contains: ['trishool'] },
        { text: 'स्वतंत्रता संग्राम में सम्पूर्ण क्रांति', contains: ['svatantrataa', 'sampoorn', 'kraanti'] },
        { text: 'उज्ज्वल भविष्य और स्वास्थ्य सेवाएँ', contains: ['ujjval', 'svaasthy'] },
        { text: 'दृष्टिकोण और उत्तरदायित्व', contains: ['drishtikon', 'uttaradaayitv'] },
        { text: 'कार्त्स्न्य का गहन अध्ययन', contains: ['kaart'] },
      ]

      for (const { text, contains } of conjuncts) {
        const slug = generateSlug(text)
        assert.ok(isValidSlug(slug), `Conjunct "${text}" must produce valid slug: got "${slug}"`)
        assert.ok(!/[\u0900-\u097F]/.test(slug), `Must contain no Devanagari in "${slug}"`)
        for (const token of contains) {
          assert.ok(slug.includes(token), `Slug "${slug}" should contain recognizable token "${token}"`)
        }
      }
    })

    // -------------------------------------------------------------
    // 5. Devanagari Numerals & Number Formatting
    // -------------------------------------------------------------
    await it('Linguistic: Devanagari numerals transliterate to Arabic digits', () => {
      const numbers = [
        { text: '०१२३४५६७८९', expected: '0123456789' },
        { text: 'वर्ष २०२६ की ५ प्रमुख घटनाएँ', expectedTokens: ['2026', '5'] },
        { text: 'बजट १०००००० रुपये', expectedTokens: ['1000000'] },
        { text: 'जीडीपी में ७.५% की वृद्धि', expectedTokens: ['7-5', 'percent'] },
      ]

      for (const item of numbers) {
        const slug = generateSlug(item.text)
        assert.ok(isValidSlug(slug), `Numerals "${item.text}" must produce valid slug: got "${slug}"`)
        if (item.expected) {
          assert.equal(slug, item.expected)
        }
        if (item.expectedTokens) {
          for (const tok of item.expectedTokens) {
            assert.ok(slug.includes(tok), `Slug "${slug}" must include token "${tok}"`)
          }
        }
      }
    })

    // -------------------------------------------------------------
    // 6. Mixed Scripts, Emojis, Symbols, and International Scripts
    // -------------------------------------------------------------
    await it('Stress: Mixed scripts (Hindi + English + Emojis + Math symbols)', () => {
      const mixed = [
        {
          input: 'PM Modi ने ₹80,000 Crore के Infrastructure Project का उद्घाटन किया',
          tokens: ['pm-modi', '80000-crore', 'infrastructure-project'],
        },
        {
          input: '🏆 ISRO का मंगलयान 🚀 मिशन सफल: 100% सफलता दर! 🎉',
          tokens: ['isro', 'saphal', '100-percent'],
        },
        {
          input: 'Café & Résumé: नई दिल्ली में International Conference 2026',
          tokens: ['cafe-and-resume', 'naee-dillee-men', 'international-conference-2026'],
        },
        {
          input: 'E = mc² & ∑(x) ≥ 100: भौतिकी का नया युग',
          tokens: ['e-mc2-and-x-100', 'bhautikee-kaa-nayaa-yug'],
        },
      ]

      for (const { input, tokens } of mixed) {
        const slug = generateSlug(input)
        assert.ok(isValidSlug(slug), `Mixed input "${input}" must produce valid slug: got "${slug}"`)
        for (const tok of tokens) {
          assert.ok(slug.includes(tok), `Slug "${slug}" must contain expected token "${tok}"`)
        }
      }
    })

    await it('Stress: Emojis-only and pure symbol titles fallback cleanly or expand symbols', () => {
      const purePunctuation = [
        '🔥🔥🔥',
        '🚀🎉🌟💎',
        '😀😃😄😁😆',
        '$$$ ### !!! ***',
        '*** === +++ /// \\\\\\',
        '¿¿¿ ¡¡¡ ««« »»»',
        '---___...:::;;;',
      ]

      for (const symbols of purePunctuation) {
        const slug = generateSlug(symbols)
        assert.ok(isValidSlug(slug), `Symbols "${symbols}" must produce valid fallback slug: got "${slug}"`)
        assert.equal(slug, 'article', `Pure symbols "${symbols}" should fallback to 'article'`)
      }

      // Symbols with built-in semantic replacements (@ -> at, % -> percent, & -> and)
      const expandingSymbols = [
        { input: '@@@ %%%', expected: 'at-at-at-percent-percent-percent' },
        { input: '&&&', expected: 'and-and-and' },
        { input: '100% @ Market', expected: '100-percent-at-market' },
      ]
      for (const { input, expected } of expandingSymbols) {
        const slug = generateSlug(input)
        assert.ok(isValidSlug(slug), `Expanding symbols "${input}" must produce valid slug: got "${slug}"`)
        assert.equal(slug, expected)
      }
    })

    await it('Stress: Non-Latin non-Devanagari scripts fallback or preserve ASCII tokens', () => {
      const foreign = [
        { text: 'أخبار عاجلة من الشرق الأوسط', expected: 'article' }, // Arabic
        { text: '北京今日天气预报：晴转多云', expected: 'article' }, // Chinese
        { text: 'Срочные новости из Москвы', expected: 'article' }, // Russian Cyrillic
        { text: '速報：東京の最新ニュース', expected: 'article' }, // Japanese
        { text: 'חדשות מרעישות מירושלים', expected: 'article' }, // Hebrew
        { text: 'Breaking News: 北京今日 2026 Announcement!', contains: 'breaking-news-2026-announcement' },
      ]

      for (const item of foreign) {
        const slug = generateSlug(item.text)
        assert.ok(isValidSlug(slug), `Foreign text "${item.text}" must produce valid slug: got "${slug}"`)
        if (item.expected) {
          assert.equal(slug, item.expected)
        }
        if (item.contains) {
          assert.ok(slug.includes(item.contains), `Slug "${slug}" must contain "${item.contains}"`)
        }
      }
    })

    // -------------------------------------------------------------
    // 7. Extreme Inputs & Boundary Conditions
    // -------------------------------------------------------------
    await it('Boundaries: Whitespace-only, empty, and invalid types', () => {
      assert.equal(generateSlug(''), 'article')
      assert.equal(generateSlug('   '), 'article')
      assert.equal(generateSlug('\t\r\n   \n\t'), 'article')
      assert.equal(generateSlug(null), 'article')
      assert.equal(generateSlug(undefined), 'article')
      assert.equal(generateSlug(12345), 'article')
      assert.equal(generateSlug({}), 'article')
      assert.equal(generateSlug('', { fallback: 'editorial' }), 'editorial')
    })

    await it('Boundaries: Extremely long titles (>1000 characters)', () => {
      // 2,500 characters of English
      const longEnglish = 'Editorial Investigation: ' + 'Deep analysis of economic policy reforms and regional governance developments in the subcontinent '.repeat(30)
      const slugEn = generateSlug(longEnglish, { maxLength: 100 })
      assert.ok(isValidSlug(slugEn), 'Long English slug must be valid')
      assert.ok(slugEn.length <= 100, `Length must be <= 100, got ${slugEn.length}`)
      assert.ok(!slugEn.endsWith('-'), 'Must not end with hyphen')

      // 3,000 characters of Hindi
      const longHindi = 'विशेष रिपोर्ट: ' + 'भारत सरकार द्वारा घोषित आर्थिक विकास योजना एवं नई नीतियां '.repeat(50)
      const slugHi = generateSlug(longHindi, { maxLength: 120 })
      assert.ok(isValidSlug(slugHi), 'Long Hindi slug must be valid')
      assert.ok(slugHi.length <= 120, `Length must be <= 120, got ${slugHi.length}`)
      assert.ok(!slugHi.endsWith('-'), 'Must not end with hyphen')
      assert.ok(!/[\u0900-\u097F]/.test(slugHi), 'Must contain no Devanagari')

      // Continuous long string without whitespace
      const unbroken = 'a'.repeat(2000)
      const slugUnbroken = generateSlug(unbroken, { maxLength: 80 })
      assert.ok(isValidSlug(slugUnbroken), 'Unbroken slug must be valid')
      assert.equal(slugUnbroken.length, 80)
    })

    await it('Boundaries: Unicode control characters (null bytes, soft hyphens, BOM, bidi)', () => {
      const controlCases = [
        'Test\u0000Null\u0000Byte',
        'Soft\u00ADHyphen\u00ADInside',
        '\uFEFFBOM\uFEFFMarker',
        '\u202EBidi\u202EOverride',
        'Zero\u200BWidth\u200BSpace',
      ]

      for (const text of controlCases) {
        const slug = generateSlug(text)
        assert.ok(isValidSlug(slug), `Control char text "${text}" must produce valid slug: got "${slug}"`)
        assert.ok(!slug.includes('\u0000'), 'Must not contain null byte')
        assert.ok(!slug.includes('\u00AD'), 'Must not contain soft hyphen')
        assert.ok(!slug.includes('\uFEFF'), 'Must not contain BOM')
      }
    })

    await it('Boundaries: Extreme maxLength options (0, 1, 5, negative)', () => {
      assert.ok(isValidSlug(generateSlug('Hello World', { maxLength: 1 })))
      assert.ok(isValidSlug(generateSlug('Hello World', { maxLength: 5 })))
      assert.ok(isValidSlug(generateSlug('Hello World', { maxLength: 0 })))
      assert.ok(isValidSlug(generateSlug('Hello World', { maxLength: -10 })))
    })

  })
}

// Allow standalone CLI execution
if (process.argv[1]?.endsWith('devanagari-unicode-stress.mjs')) {
  runDevanagariUnicodeStressTests()
}
