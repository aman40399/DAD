/**
 * Reading time calculation oracle.
 * Authoritative source: PROJECT.md Feature 23
 * Rules:
 * - Word count calculation based on whitespace-delimited tokens
 * - Standard 200 WPM rate
 * - "1 min read" floor for empty or short articles
 */

export function calculateExpectedReadingTime(content = '', wpm = 200) {
  if (!content || typeof content !== 'string') return '1 min read'
  // Strip HTML / markdown formatting tokens
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/[#*_`~>-]/g, ' ')
  const words = plainText.trim().split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  if (wordCount === 0) return '1 min read'

  const minutes = Math.max(1, Math.ceil(wordCount / wpm))
  return `${minutes} min read`
}
