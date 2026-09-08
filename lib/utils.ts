/**
 * Utility functions for slug generation, multilingual transliteration,
 * collision resolution, date formatting, and media extraction.
 */

export interface SlugOptions {
  maxLength?: number
  fallback?: string
  stripAccents?: boolean
}

/**
 * Transliterates Devanagari (Hindi) script into Latin characters.
 * Handles independent vowels, matras (dependent vowel signs), conjuncts,
 * nukta characters, halant/virama, anusvara, candrabindu, visarga,
 * digits, and word-boundary inherent vowel / schwa deletion rules.
 */
export function transliterateDevanagari(text: string): string {
  if (!text) return ''

  // Normalize Unicode to NFC
  let s = text.normalize('NFC')

  // Replace dandas, double dandas, and abbreviation signs with spaces
  s = s.replace(/[।॥॰]/g, ' ')

  // Independent vowels (स्वर)
  const independentVowels: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ऋ': 'ri', 'ॠ': 'ri', 'ऌ': 'lri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'ऑ': 'o', 'ऍ': 'e', 'ऄ': 'e', 'ऎ': 'e', 'ऒ': 'o',
  }

  // Dependent vowel signs (मात्रा)
  const matras: Record<string, string> = {
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'ृ': 'ri', 'ॄ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ॉ': 'o', 'ॅ': 'e', 'ॆ': 'e', 'ॊ': 'o',
  }

  // Base and nukta consonants (व्यंजन)
  const consonants: Record<string, string> = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n', 'ऩ': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ऱ': 'r', 'ल': 'l', 'ळ': 'l', 'ऴ': 'zh',
    'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    // Precomposed nukta consonants
    'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z',
    'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f', 'य़': 'y',
  }

  // Devanagari numerals ०-९
  const digits: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  }

  let out = ''
  let i = 0
  const len = s.length

  while (i < len) {
    // 1. Common 3-character conjuncts
    // ज्ञ (ज + ् + ञ) -> 'gy'
    if (s[i] === 'ज' && s[i + 1] === '्' && s[i + 2] === 'ञ') {
      out += 'gy'
      i += 3
      if (i < len && matras[s[i]]) {
        out += matras[s[i]]
        i++
      } else if (i < len && (consonants[s[i]] || independentVowels[s[i]])) {
        out += 'a'
      }
      continue
    }
    // क्ष (क + ् + ष) -> 'ksh'
    if (s[i] === 'क' && s[i + 1] === '्' && s[i + 2] === 'ष') {
      out += 'ksh'
      i += 3
      if (i < len && matras[s[i]]) {
        out += matras[s[i]]
        i++
      } else if (i < len && (consonants[s[i]] || independentVowels[s[i]])) {
        out += 'a'
      }
      continue
    }
    // श्र (श + ् + र) -> 'shr'
    if (s[i] === 'श' && s[i + 1] === '्' && s[i + 2] === 'र') {
      out += 'shr'
      i += 3
      if (i < len && matras[s[i]]) {
        out += matras[s[i]]
        i++
      } else if (i < len && (consonants[s[i]] || independentVowels[s[i]])) {
        out += 'a'
      }
      continue
    }
    // त्र (त + ् + र) -> 'tr'
    if (s[i] === 'त' && s[i + 1] === '्' && s[i + 2] === 'र') {
      out += 'tr'
      i += 3
      if (i < len && matras[s[i]]) {
        out += matras[s[i]]
        i++
      } else if (i < len && (consonants[s[i]] || independentVowels[s[i]])) {
        out += 'a'
      }
      continue
    }

    const ch = s[i]
    const nextCh = i + 1 < len ? s[i + 1] : ''

    // 2. Check decomposed nukta (base consonant + nukta U+093C)
    let cSound: string | null = null
    if (nextCh === '़') {
      const combined = ch + nextCh
      if (consonants[combined]) {
        cSound = consonants[combined]
        i += 2
      }
    } else if (consonants[ch]) {
      cSound = consonants[ch]
      i++
    }

    // 3. If a consonant was matched, determine inherent vowel vs matra vs halant
    if (cSound !== null) {
      out += cSound
      const afterC = i < len ? s[i] : ''

      if (afterC === '्') {
        // Halant cancels the inherent vowel
        i++
      } else if (matras[afterC]) {
        // Matra replaces inherent vowel
        out += matras[afterC]
        i++
      } else if (afterC === 'ं' || afterC === 'ँ') {
        // Anusvara / Candrabindu: append 'an'
        out += 'an'
        i++
      } else if (
        consonants[afterC] ||
        independentVowels[afterC] ||
        (afterC >= 'a' && afterC <= 'z') ||
        (afterC >= 'A' && afterC <= 'Z')
      ) {
        // Followed by another consonant/vowel: append inherent 'a'
        out += 'a'
      }
      // Word-final consonant: schwa deletion (no vowel added)
      continue
    }

    // 4. Digits
    if (digits[ch]) {
      out += digits[ch]
      i++
    } else if (independentVowels[ch]) {
      // 5. Independent vowels
      out += independentVowels[ch]
      i++
    } else if (matras[ch]) {
      // 6. Standalone matra
      out += matras[ch]
      i++
    } else if (ch === 'ं' || ch === 'ँ') {
      // 7. Standalone anusvara / candrabindu
      out += 'n'
      i++
    } else if (ch === 'ः') {
      // 8. Visarga
      out += 'h'
      i++
    } else if (ch === '्') {
      // 9. Stray halant
      i++
    } else {
      // Non-Devanagari character
      out += ch
      i++
    }
  }

  return out
}

/**
 * Generates a clean, URL-safe, lowercase ASCII slug from any title.
 * Fully supports Hindi/Devanagari script transliteration, Latin diacritics
 * removal (accents), special punctuation expansion, word boundary hyphenation,
 * and length capping.
 */
export function generateSlug(title: string, options?: SlugOptions): string {
  if (!title || typeof title !== 'string') {
    return options?.fallback || 'article'
  }

  const maxLength = options?.maxLength ?? 100
  const fallback = options?.fallback ?? 'article'

  let processed = title

  // 1. Transliterate Devanagari if present
  if (/[\u0900-\u097F]/.test(processed)) {
    processed = transliterateDevanagari(processed)
  }

  // 2. Expand symbols and clean delimiters
  processed = processed
    .replace(/(\d),(\d)/g, '$1$2') // strip thousands separator comma e.g. 80,000 -> 80000
    .replace(/&/g, ' and ')
    .replace(/@/g, ' at ')
    .replace(/%/g, ' percent ')
    .replace(/['’"“”`]/g, '') // remove quotes/apostrophes directly (don't add extra hyphens)
    .replace(/[—–_/|\\:;+=]/g, ' ') // treat dashes, slashes, pipes, colons as separators

  // 3. Normalize Latin accents/diacritics (Café -> Cafe, Naïve -> Naive)
  if (options?.stripAccents !== false) {
    processed = processed
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  // 4. Lowercase and replace all non-alphanumeric characters with hyphens
  let slug = processed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()

  // 5. Capping maximum length at word/hyphen boundary
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength)
    const lastHyphen = truncated.lastIndexOf('-')
    slug = lastHyphen > Math.floor(maxLength * 0.4) ? truncated.substring(0, lastHyphen) : truncated
    slug = slug.replace(/-+$/g, '')
  }

  // 6. Final fallback if slug resulted in empty string
  if (!slug) {
    slug = fallback
  }

  return slug
}

/**
 * Validates whether a slug is strictly URL-safe ASCII conformant.
 * Must match: 1 or more lowercase alphanumeric chunks separated by single hyphens.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}

/**
 * Resolves slug collisions by querying the store or database with an isTaken checker.
 * If baseSlug is available, returns baseSlug.
 * Otherwise, tries baseSlug-1, baseSlug-2, etc.
 * Features a safety bound to prevent infinite loops.
 */
export async function resolveSlugCollision(
  baseSlug: string,
  isTaken: (candidate: string) => Promise<boolean> | boolean
): Promise<string> {
  const cleanBase = isValidSlug(baseSlug) ? baseSlug : generateSlug(baseSlug)

  if (!await isTaken(cleanBase)) {
    return cleanBase
  }

  let counter = 1
  while (counter <= 1000) {
    const candidate = `${cleanBase}-${counter}`
    if (!await isTaken(candidate)) {
      return candidate
    }
    counter++
  }

  // Fallback in extreme collision/mock cases
  return `${cleanBase}-${Date.now()}`
}

/**
 * Synchronous collision resolution when a list or Set of existing slugs is already loaded.
 */
export function resolveSlugCollisionFromList(
  baseSlug: string,
  existingSlugs: string[] | Set<string>
): string {
  const set = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs)
  const cleanBase = isValidSlug(baseSlug) ? baseSlug : generateSlug(baseSlug)

  if (!set.has(cleanBase)) {
    return cleanBase
  }

  let counter = 1
  while (counter <= 1000) {
    const candidate = `${cleanBase}-${counter}`
    if (!set.has(candidate)) {
      return candidate
    }
    counter++
  }

  return `${cleanBase}-${Date.now()}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return formatDate(dateString)
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
