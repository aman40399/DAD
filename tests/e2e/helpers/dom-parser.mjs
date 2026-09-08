/**
 * Lightweight HTML inspection helper for SSR response bodies in E2E tests.
 * Performs deterministic regex and structural parsing without heavy browser overhead.
 */

export class DomParser {
  constructor(html) {
    this.html = html || ''
  }

  hasText(text) {
    return this.html.includes(text)
  }

  hasTagWithClass(tag, className) {
    const regex = new RegExp(`<${tag}[^>]*class=["'][^"']*\\b${className}\\b[^"']*["']`, 'i')
    return regex.test(this.html)
  }

  hasElementWithText(tag, textSnippet) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi')
    let match
    while ((match = regex.exec(this.html)) !== null) {
      if (match[1].includes(textSnippet)) {
        return true
      }
    }
    return false
  }

  findMetaContent(metaNameOrProperty) {
    const regex = new RegExp(
      `<meta[^>]+(?:name|property)=["']${metaNameOrProperty}["'][^>]+content=["']([^"']*)["']`,
      'i'
    )
    const match = this.html.match(regex)
    return match ? match[1] : null
  }

  getTitle() {
    const match = this.html.match(/<title[^>]*>([^<]*)<\/title>/i)
    return match ? match[1].trim() : null
  }

  hasDropCap() {
    // Check for drop-cap CSS classes or first-letter typography styling
    return (
      this.html.includes('drop-cap') ||
      this.html.includes('first-letter:') ||
      this.html.includes('float-left')
    )
  }

  hasSerifTypography() {
    return (
      this.html.includes('font-serif') ||
      this.html.includes('Source_Serif_4') ||
      this.html.includes('source-serif')
    )
  }

  hasCaptionWithCredit() {
    // Expected format: "[Caption] | Photo: [Credit]"
    return /Photo:\s*[^<]+/i.test(this.html) || /\|\s*Photo:/i.test(this.html)
  }

  hasReadingTime() {
    // Expected format: "[N] min read"
    return /\d+\s*min\s*read/i.test(this.html)
  }

  hasBookmarkButton() {
    return (
      this.html.includes('bookmark') ||
      this.html.includes('Bookmark') ||
      this.html.includes('aria-label="Bookmark') ||
      this.html.includes('Save')
    )
  }

  hasBreakingTicker() {
    return (
      this.html.includes('BREAKING') ||
      this.html.includes('Breaking') ||
      this.html.includes('ticker')
    )
  }

  getAllLinks() {
    const matches = [...this.html.matchAll(/href=["']([^"']+)["']/g)]
    return matches.map(m => m[1])
  }
}
