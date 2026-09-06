'use client'

import { useState, useEffect } from 'react'

interface SEOAnalysis {
  score: number
  checks: SEOCheck[]
  suggestions: string[]
}

interface SEOCheck {
  name: string
  status: 'pass' | 'warning' | 'fail'
  message: string
  weight: number
}

interface SEOAnalyzerProps {
  title: string
  content: string
  excerpt: string
  slug: string
  category: string
  tags: string[]
  focusKeyword?: string
}

export default function SEOAnalyzer({
  title,
  content,
  excerpt,
  slug,
  category,
  tags,
  focusKeyword = ''
}: SEOAnalyzerProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [keyword, setKeyword] = useState(focusKeyword)

  useEffect(() => {
    const analyzeContent = () => {
      const checks: SEOCheck[] = []
      const suggestions: string[] = []

      // Strip HTML tags from content for analysis
      const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const wordCount = plainContent.split(' ').filter(w => w.length > 0).length
      const titleLength = title.length
      const excerptLength = excerpt.length
      const slugLength = slug.length

      // 1. Title Length Check (40-60 characters optimal)
      if (titleLength >= 40 && titleLength <= 60) {
        checks.push({
          name: 'Title Length',
          status: 'pass',
          message: `Title is ${titleLength} characters (optimal range)`,
          weight: 10
        })
      } else if (titleLength < 40) {
        checks.push({
          name: 'Title Length',
          status: 'warning',
          message: `Title is ${titleLength} characters (too short, aim for 40-60)`,
          weight: 10
        })
        suggestions.push('Expand your title to 40-60 characters for better SEO')
      } else {
        checks.push({
          name: 'Title Length',
          status: 'fail',
          message: `Title is ${titleLength} characters (too long, trim to 60)`,
          weight: 10
        })
        suggestions.push('Shorten your title to under 60 characters')
      }

      // 2. Excerpt/Meta Description Length (120-160 characters optimal)
      if (excerptLength >= 120 && excerptLength <= 160) {
        checks.push({
          name: 'Meta Description',
          status: 'pass',
          message: `Excerpt is ${excerptLength} characters (optimal)`,
          weight: 10
        })
      } else if (excerptLength < 120) {
        checks.push({
          name: 'Meta Description',
          status: 'warning',
          message: `Excerpt is ${excerptLength} characters (aim for 120-160)`,
          weight: 10
        })
        suggestions.push('Expand excerpt to 120-160 characters for better click-through rate')
      } else {
        checks.push({
          name: 'Meta Description',
          status: 'fail',
          message: `Excerpt is ${excerptLength} characters (too long)`,
          weight: 10
        })
        suggestions.push('Shorten excerpt to under 160 characters')
      }

      // 3. Content Length Check (minimum 300 words)
      if (wordCount >= 1000) {
        checks.push({
          name: 'Content Length',
          status: 'pass',
          message: `${wordCount} words (excellent depth)`,
          weight: 15
        })
      } else if (wordCount >= 300) {
        checks.push({
          name: 'Content Length',
          status: 'warning',
          message: `${wordCount} words (consider adding more depth)`,
          weight: 15
        })
        suggestions.push('Aim for 1000+ words for comprehensive content')
      } else {
        checks.push({
          name: 'Content Length',
          status: 'fail',
          message: `${wordCount} words (too short, minimum 300 words)`,
          weight: 15
        })
        suggestions.push('Add at least 300 words of quality content')
      }

      // 4. URL Slug Length (3-5 words optimal)
      const slugWords = slug.split('-').filter(w => w.length > 0).length
      if (slugWords >= 3 && slugWords <= 5) {
        checks.push({
          name: 'URL Structure',
          status: 'pass',
          message: `Slug has ${slugWords} words (optimal)`,
          weight: 8
        })
      } else if (slugWords < 3) {
        checks.push({
          name: 'URL Structure',
          status: 'warning',
          message: `Slug has ${slugWords} words (add more context)`,
          weight: 8
        })
        suggestions.push('Use 3-5 words in URL slug for better SEO')
      } else {
        checks.push({
          name: 'URL Structure',
          status: 'warning',
          message: `Slug has ${slugWords} words (consider shortening)`,
          weight: 8
        })
        suggestions.push('Keep URL slug concise (3-5 words)')
      }

      // 5. Focus Keyword Analysis
      if (keyword) {
        const keywordLower = keyword.toLowerCase()
        const titleLower = title.toLowerCase()
        const contentLower = plainContent.toLowerCase()
        const excerptLower = excerpt.toLowerCase()

        // Keyword in title
        if (titleLower.includes(keywordLower)) {
          checks.push({
            name: 'Keyword in Title',
            status: 'pass',
            message: 'Focus keyword found in title',
            weight: 15
          })
        } else {
          checks.push({
            name: 'Keyword in Title',
            status: 'fail',
            message: 'Focus keyword not in title',
            weight: 15
          })
          suggestions.push(`Add "${keyword}" to your title`)
        }

        // Keyword in excerpt
        if (excerptLower.includes(keywordLower)) {
          checks.push({
            name: 'Keyword in Meta',
            status: 'pass',
            message: 'Focus keyword found in excerpt',
            weight: 10
          })
        } else {
          checks.push({
            name: 'Keyword in Meta',
            status: 'warning',
            message: 'Focus keyword not in excerpt',
            weight: 10
          })
          suggestions.push(`Include "${keyword}" in excerpt`)
        }

        // Keyword density (0.5% - 2.5% is optimal)
        const keywordMatches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length
        const keywordDensity = wordCount > 0 ? (keywordMatches / wordCount) * 100 : 0

        if (keywordDensity >= 0.5 && keywordDensity <= 2.5) {
          checks.push({
            name: 'Keyword Density',
            status: 'pass',
            message: `${keywordDensity.toFixed(2)}% (optimal range)`,
            weight: 12
          })
        } else if (keywordDensity < 0.5) {
          checks.push({
            name: 'Keyword Density',
            status: 'warning',
            message: `${keywordDensity.toFixed(2)}% (use keyword more)`,
            weight: 12
          })
          suggestions.push(`Use "${keyword}" more naturally in content (aim for 0.5-2.5%)`)
        } else {
          checks.push({
            name: 'Keyword Density',
            status: 'fail',
            message: `${keywordDensity.toFixed(2)}% (keyword stuffing)`,
            weight: 12
          })
          suggestions.push(`Reduce usage of "${keyword}" to avoid keyword stuffing`)
        }
      } else {
        checks.push({
          name: 'Focus Keyword',
          status: 'warning',
          message: 'No focus keyword set',
          weight: 15
        })
        suggestions.push('Set a focus keyword for better SEO optimization')
      }

      // 6. Internal Links (check for links)
      const internalLinkMatches = (content.match(/href=["']\/[^"']*["']/g) || []).length
      if (internalLinkMatches >= 2) {
        checks.push({
          name: 'Internal Links',
          status: 'pass',
          message: `${internalLinkMatches} internal links found`,
          weight: 8
        })
      } else if (internalLinkMatches >= 1) {
        checks.push({
          name: 'Internal Links',
          status: 'warning',
          message: `${internalLinkMatches} internal link (add more)`,
          weight: 8
        })
        suggestions.push('Add at least 2-3 internal links to related content')
      } else {
        checks.push({
          name: 'Internal Links',
          status: 'fail',
          message: 'No internal links found',
          weight: 8
        })
        suggestions.push('Add internal links to improve site structure and SEO')
      }

      // 7. External Links
      const externalLinkMatches = (content.match(/href=["']https?:\/\/[^"']*["']/g) || []).length
      if (externalLinkMatches >= 1) {
        checks.push({
          name: 'External Links',
          status: 'pass',
          message: `${externalLinkMatches} external links found`,
          weight: 5
        })
      } else {
        checks.push({
          name: 'External Links',
          status: 'warning',
          message: 'No external links',
          weight: 5
        })
        suggestions.push('Add 1-2 authoritative external links for credibility')
      }

      // 8. Headings Structure
      const h1Matches = (content.match(/<h1[^>]*>/gi) || []).length
      const h2Matches = (content.match(/<h2[^>]*>/gi) || []).length
      const h3Matches = (content.match(/<h3[^>]*>/gi) || []).length

      if (h2Matches >= 2) {
        checks.push({
          name: 'Heading Structure',
          status: 'pass',
          message: `${h2Matches} H2 headings, ${h3Matches} H3 headings`,
          weight: 10
        })
      } else {
        checks.push({
          name: 'Heading Structure',
          status: 'warning',
          message: 'Add more subheadings (H2, H3)',
          weight: 10
        })
        suggestions.push('Use at least 2-3 H2 subheadings to structure content')
      }

      // 9. Tags Check
      if (tags.length >= 3) {
        checks.push({
          name: 'Tags/Keywords',
          status: 'pass',
          message: `${tags.length} tags added`,
          weight: 7
        })
      } else {
        checks.push({
          name: 'Tags/Keywords',
          status: 'warning',
          message: `Only ${tags.length} tags (add more)`,
          weight: 7
        })
        suggestions.push('Add at least 3-5 relevant tags')
      }

      // Calculate overall score
      const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0)
      const earnedScore = checks.reduce((sum, check) => {
        if (check.status === 'pass') return sum + check.weight
        if (check.status === 'warning') return sum + (check.weight * 0.5)
        return sum
      }, 0)
      const score = Math.round((earnedScore / totalWeight) * 100)

      setAnalysis({ score, checks, suggestions })
    }

    analyzeContent()
  }, [title, content, excerpt, slug, category, tags, keyword])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-300'
    if (score >= 60) return 'bg-yellow-100 border-yellow-300'
    return 'bg-red-100 border-red-300'
  }

  if (!analysis) return null

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
          📊 SEO Analysis
        </h3>
        <div className={`px-4 py-2 rounded-lg border-2 ${getScoreBgColor(analysis.score)}`}>
          <span className={`text-3xl font-black ${getScoreColor(analysis.score)}`}>
            {analysis.score}
          </span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-1">/100</span>
        </div>
      </div>

      {/* Focus Keyword Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          🎯 Focus Keyword (Optional)
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g., artificial intelligence, breaking news, etc."
          className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Set a focus keyword to get keyword-specific SEO recommendations
        </p>
      </div>

      {/* SEO Checks */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
          SEO Checks
        </h4>
        {analysis.checks.map((check, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {check.status === 'pass' && <span className="text-green-600 text-xl">✓</span>}
              {check.status === 'warning' && <span className="text-yellow-600 text-xl">⚠</span>}
              {check.status === 'fail' && <span className="text-red-600 text-xl">✗</span>}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-neutral-900 dark:text-white">
                {check.name}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-600 pt-4">
          <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-3">
            💡 Suggestions
          </h4>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="text-blue-600 flex-shrink-0">→</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Score Interpretation */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-600">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          <strong>Score Guide:</strong> 80-100 (Excellent) | 60-79 (Good) | Below 60 (Needs Improvement)
        </div>
      </div>
    </div>
  )
}
