'use client'

import { useState } from 'react'

interface AISEOOptimizerProps {
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  onOptimize: (optimized: {
    title: string
    excerpt: string
    content: string
    tags: string[]
    focusKeyword: string
  }) => void
}

export default function AISEOOptimizer({
  title,
  content,
  excerpt,
  category,
  tags,
  onOptimize
}: AISEOOptimizerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [optimizing, setOptimizingStep] = useState('')
  const [fixedIssues, setFixedIssues] = useState<string[]>([])
  const [initialScore, setInitialScore] = useState<number>(0)
  const [hasCheckedScore, setHasCheckedScore] = useState(false)
  const [optimizingItem, setOptimizingItem] = useState<string | null>(null)

  const analyzeContent = () => {
    // Strip HTML for analysis
    const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = plainContent.split(' ').filter(w => w.length > 0).length
    const titleLength = title.length
    const excerptLength = excerpt.length

    const issues = []
    const passes = []

    // Title Length
    if (titleLength < 40) {
      issues.push({ type: 'title_short', message: `Title is only ${titleLength} chars (need 40-60)`, severity: 'high' })
    } else if (titleLength > 60) {
      issues.push({ type: 'title_long', message: `Title is ${titleLength} chars (max 60)`, severity: 'high' })
    } else {
      passes.push('Title length optimal')
    }

    // Excerpt Length
    if (excerptLength < 120) {
      issues.push({ type: 'excerpt_short', message: `Excerpt is only ${excerptLength} chars (need 120-160)`, severity: 'medium' })
    } else if (excerptLength > 160) {
      issues.push({ type: 'excerpt_long', message: `Excerpt is ${excerptLength} chars (max 160)`, severity: 'medium' })
    } else {
      passes.push('Excerpt length optimal')
    }

    // Content Length
    if (wordCount < 300) {
      issues.push({ type: 'content_short', message: `Only ${wordCount} words (minimum 300)`, severity: 'critical' })
    } else if (wordCount < 1000) {
      issues.push({ type: 'content_medium', message: `${wordCount} words (recommend 1000+)`, severity: 'low' })
    } else {
      passes.push(`Content length excellent (${wordCount} words)`)
    }

    // Headings
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length
    const h3Count = (content.match(/<h3[^>]*>/gi) || []).length
    if (h2Count < 2) {
      issues.push({ type: 'headings', message: 'Need at least 2 H2 headings', severity: 'medium' })
    } else {
      passes.push(`Good heading structure (${h2Count} H2, ${h3Count} H3)`)
    }

    // Internal Links
    const internalLinks = (content.match(/href=["']\/[^"']*["']/g) || []).length
    if (internalLinks < 2) {
      issues.push({ type: 'internal_links', message: 'Need at least 2 internal links', severity: 'medium' })
    } else {
      passes.push(`${internalLinks} internal links`)
    }

    // External Links
    const externalLinks = (content.match(/href=["']https?:\/\/[^"']*["']/g) || []).length
    if (externalLinks < 1) {
      issues.push({ type: 'external_links', message: 'Need at least 1 external authoritative link', severity: 'low' })
    } else {
      passes.push(`${externalLinks} external links`)
    }

    // Tags
    if (tags.length < 3) {
      issues.push({ type: 'tags', message: 'Need at least 3-5 tags', severity: 'low' })
    } else {
      passes.push(`${tags.length} tags`)
    }

    const score = Math.round(((passes.length) / (passes.length + issues.length)) * 100)

    return { issues, passes, score }
  }

  const handleAnalyze = () => {
    setIsOpen(true)
    setHasCheckedScore(false)
    setAnalysis(null)
    setFixedIssues([])
  }

  const handleCheckScore = () => {
    const result = analyzeContent()
    setAnalysis(result)
    setInitialScore(result.score)
    setHasCheckedScore(true)
    setFixedIssues([])
  }

  const handleAutoOptimize = async () => {
    setIsOptimizing(true)
    setFixedIssues([])
    
    let newTitle = title
    let newExcerpt = excerpt
    let newContent = content
    let newTags = tags
    let focusKeyword = ''
    
    try {
      // STEP 1: Check and Fix Title
      setOptimizingStep('📋 Analyzing title...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const titleIssue = analyzeTitleIssue(title)
      if (titleIssue) {
        setOptimizingStep(`⚠️ Title issue: ${titleIssue} - Asking AI to fix...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        newTitle = await fixTitle(title, content, category, titleIssue)
        setOptimizingStep(`✅ Title fixed: "${newTitle}"`)
        setFixedIssues(prev => [...prev, 'title'])
        
        // Apply immediately and update score
        onOptimize({
          title: newTitle,
          excerpt: excerpt,
          content: content,
          tags: tags,
          focusKeyword: ''
        })
        
        // Re-analyze with new data
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Title is already good!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // STEP 2: Check and Fix Excerpt
      setOptimizingStep('📋 Analyzing meta description...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const excerptIssue = analyzeExcerptIssue(excerpt)
      if (excerptIssue) {
        setOptimizingStep(`⚠️ Excerpt issue: ${excerptIssue} - Asking AI to fix...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        newExcerpt = await fixExcerpt(newTitle, content, category, excerptIssue)
        setOptimizingStep(`✅ Excerpt fixed!`)
        setFixedIssues(prev => [...prev, 'excerpt'])
        
        // Apply immediately and update score
        onOptimize({
          title: newTitle,
          excerpt: newExcerpt,
          content: content,
          tags: tags,
          focusKeyword: ''
        })
        
        // Re-analyze with new data
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Excerpt is already good!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // STEP 3: Extract Focus Keyword
      setOptimizingStep('🔍 Finding best SEO keyword...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      focusKeyword = await findFocusKeyword(newTitle, content)
      setOptimizingStep(`✅ Focus keyword: "${focusKeyword}"`)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // STEP 4: Check and Fix Content Structure
      setOptimizingStep('📋 Analyzing content structure...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const contentIssues = analyzeContentIssues(content)
      if (contentIssues.length > 0) {
        setOptimizingStep(`⚠️ Content needs: ${contentIssues.join(', ')} - Asking AI to fix...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        newContent = await fixContent(content, focusKeyword, contentIssues)
        setOptimizingStep(`✅ Content enhanced with proper structure!`)
        setFixedIssues(prev => [...prev, 'content_structure', 'headings'])
        
        // Apply immediately and update score
        onOptimize({
          title: newTitle,
          excerpt: newExcerpt,
          content: newContent,
          tags: tags,
          focusKeyword: focusKeyword
        })
        
        // Re-analyze with new data
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Content structure is good!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // STEP 5: Check and Fix Tags
      setOptimizingStep('📋 Analyzing tags...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const tagsIssue = analyzeTagsIssue(tags)
      if (tagsIssue) {
        setOptimizingStep(`⚠️ Tags issue: ${tagsIssue} - Asking AI to generate...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        newTags = await fixTags(newTitle, newContent, category)
        setOptimizingStep(`✅ Tags generated: ${newTags.join(', ')}`)
        setFixedIssues(prev => [...prev, 'tags'])
        
        // Apply final and update score
        onOptimize({
          title: newTitle,
          excerpt: newExcerpt,
          content: newContent,
          tags: newTags,
          focusKeyword: focusKeyword
        })
        
        // Final re-analyze
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Tags are already good!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Done!
      setOptimizingStep('✅ All SEO issues fixed! Final score updated.')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setOptimizingStep('')

    } catch (error) {
      console.error('Optimization error:', error)
      setOptimizingStep('❌ Error occurred. Please try again.')
      await new Promise(resolve => setTimeout(resolve, 3000))
    } finally {
      setIsOptimizing(false)
      setOptimizingStep('')
    }
  }

  // INDIVIDUAL OPTIMIZATION FUNCTIONS
  const handleOptimizeTitle = async () => {
    setOptimizingItem('title')
    setIsOptimizing(true)
    try {
      setOptimizingStep('📋 Analyzing title...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const titleIssue = analyzeTitleIssue(title)
      if (titleIssue) {
        setOptimizingStep(`⚠️ Fixing: ${titleIssue}`)
        const newTitle = await fixTitle(title, content, category, titleIssue)
        setFixedIssues(prev => [...prev, 'title'])
        
        onOptimize({
          title: newTitle,
          excerpt: excerpt,
          content: content,
          tags: tags,
          focusKeyword: ''
        })
        
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        setOptimizingStep('✅ Title optimized!')
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Title is already perfect!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      setOptimizingStep('❌ Error optimizing title')
    } finally {
      setIsOptimizing(false)
      setOptimizingItem(null)
      setOptimizingStep('')
    }
  }

  const handleOptimizeExcerpt = async () => {
    setOptimizingItem('excerpt')
    setIsOptimizing(true)
    try {
      setOptimizingStep('📋 Analyzing meta description...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const excerptIssue = analyzeExcerptIssue(excerpt)
      if (excerptIssue) {
        setOptimizingStep(`⚠️ Fixing: ${excerptIssue}`)
        const newExcerpt = await fixExcerpt(title, content, category, excerptIssue)
        setFixedIssues(prev => [...prev, 'excerpt'])
        
        onOptimize({
          title: title,
          excerpt: newExcerpt,
          content: content,
          tags: tags,
          focusKeyword: ''
        })
        
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        setOptimizingStep('✅ Excerpt optimized!')
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Excerpt is already perfect!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      setOptimizingStep('❌ Error optimizing excerpt')
    } finally {
      setIsOptimizing(false)
      setOptimizingItem(null)
      setOptimizingStep('')
    }
  }

  const handleOptimizeContent = async () => {
    setOptimizingItem('content')
    setIsOptimizing(true)
    try {
      setOptimizingStep('🔍 Finding focus keyword...')
      const focusKeyword = await findFocusKeyword(title, content)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setOptimizingStep('📋 Analyzing content structure...')
      const contentIssues = analyzeContentIssues(content)
      
      if (contentIssues.length > 0) {
        setOptimizingStep(`⚠️ Fixing: ${contentIssues.join(', ')}`)
        const newContent = await fixContent(content, focusKeyword, contentIssues)
        setFixedIssues(prev => [...prev, 'content_structure', 'headings'])
        
        onOptimize({
          title: title,
          excerpt: excerpt,
          content: newContent,
          tags: tags,
          focusKeyword: focusKeyword
        })
        
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        setOptimizingStep('✅ Content optimized!')
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Content structure is already perfect!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      setOptimizingStep('❌ Error optimizing content')
    } finally {
      setIsOptimizing(false)
      setOptimizingItem(null)
      setOptimizingStep('')
    }
  }

  const handleOptimizeTags = async () => {
    setOptimizingItem('tags')
    setIsOptimizing(true)
    try {
      setOptimizingStep('📋 Analyzing tags...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const tagsIssue = analyzeTagsIssue(tags)
      if (tagsIssue) {
        setOptimizingStep(`⚠️ Generating tags...`)
        const newTags = await fixTags(title, content, category)
        setFixedIssues(prev => [...prev, 'tags'])
        
        onOptimize({
          title: title,
          excerpt: excerpt,
          content: content,
          tags: newTags,
          focusKeyword: ''
        })
        
        const updatedAnalysis = analyzeContent()
        setAnalysis(updatedAnalysis)
        setOptimizingStep('✅ Tags optimized!')
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        setOptimizingStep('✅ Tags are already perfect!')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      setOptimizingStep('❌ Error optimizing tags')
    } finally {
      setIsOptimizing(false)
      setOptimizingItem(null)
      setOptimizingStep('')
    }
  }

  const handleOptimizeKeyword = async () => {
    setOptimizingItem('keyword')
    setIsOptimizing(true)
    try {
      setOptimizingStep('🔍 Extracting focus keyword...')
      const focusKeyword = await findFocusKeyword(title, content)
      
      onOptimize({
        title: title,
        excerpt: excerpt,
        content: content,
        tags: tags,
        focusKeyword: focusKeyword
      })
      
      setOptimizingStep(`✅ Focus keyword found: "${focusKeyword}"`)
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (error) {
      setOptimizingStep('❌ Error finding keyword')
    } finally {
      setIsOptimizing(false)
      setOptimizingItem(null)
      setOptimizingStep('')
    }
  }

  // ISSUE ANALYZERS
  const analyzeTitleIssue = (ttl: string): string | null => {
    if (!ttl || ttl.length < 10) return 'Title too short or empty'
    if (ttl.length < 40) return `Only ${ttl.length} characters (need 40-60)`
    if (ttl.length > 60) return `Too long at ${ttl.length} characters (max 60)`
    return null
  }

  const analyzeExcerptIssue = (exc: string): string | null => {
    if (!exc || exc.length < 10) return 'Excerpt empty or too short'
    if (exc.length < 120) return `Only ${exc.length} characters (need 120-160)`
    if (exc.length > 160) return `Too long at ${exc.length} characters (max 160)`
    return null
  }

  const analyzeContentIssues = (cnt: string): string[] => {
    const issues = []
    const h2Count = (cnt.match(/<h2[^>]*>/gi) || []).length
    const h3Count = (cnt.match(/<h3[^>]*>/gi) || []).length
    
    if (h2Count < 2) issues.push('headings')
    if (h2Count < 2 || h3Count < 3) issues.push('better structure')
    
    return issues
  }

  const analyzeTagsIssue = (tgs: string[]): string | null => {
    if (!tgs || tgs.length === 0) return 'No tags'
    if (tgs.length < 3) return `Only ${tgs.length} tags (need 3-5)`
    return null
  }

  // AI FIXERS
  const fixTitle = async (currentTitle: string, cnt: string, cat: string, issue: string): Promise<string> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, ' ').trim().substring(0, 500)
      
      console.log('🔧 Fixing title...')
      console.log('Current:', currentTitle)
      console.log('Issue:', issue)
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Title: "${currentTitle}"\nCategory: ${cat}\nContent: ${plainContent}`,
          prompt: `Fix this article title for SEO. Issue: ${issue}. Create a NEW title that is EXACTLY 40-60 characters long. Include the main topic/keyword naturally. Make it compelling and newsworthy. Use clear, professional language. Return just the new title text, nothing else. No quotes, no explanation.`,
          action: 'headline',
          language: 'english'
        })
      })

      const data = await response.json()
      console.log('✅ Title API Response:', {
        success: data.success,
        content: data.content?.substring(0, 100)
      })
      
      let fixed = data.content?.replace(/<[^>]*>/g, '').replace(/^["'\s]+|["'\s]+$/g, '').trim() || ''
      
      // Clean up if it starts with "Option 1:" or similar
      fixed = fixed.replace(/^(Option|Title)\s*\d*:?\s*/i, '').trim()
      
      // Ensure length
      if (fixed.length > 60) fixed = fixed.substring(0, 57) + '...'
      if (fixed.length < 40 || !fixed) {
        console.warn('⚠️ Generated title too short, keeping original')
        return currentTitle
      }
      
      console.log('✅ Fixed title:', fixed)
      return fixed
    } catch (error) {
      console.error('❌ Title fix error:', error)
      return currentTitle
    }
  }

  const fixExcerpt = async (ttl: string, cnt: string, cat: string, issue: string): Promise<string> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, ' ').trim().substring(0, 600)
      
      console.log('🔧 Fixing excerpt...')
      console.log('Title:', ttl)
      console.log('Issue:', issue)
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Title: "${ttl}"\nCategory: ${cat}\nContent: ${plainContent}`,
          prompt: `Write a meta description for this article. Issue: ${issue}. Write EXACTLY 120-160 characters (strict!). Summarize the main point, include main keywords, make readers want to click. Return just the meta description text, nothing else. No quotes, no explanation.`,
          action: 'excerpt',
          language: 'english'
        })
      })

      const data = await response.json()
      console.log('✅ Excerpt API Response:', {
        success: data.success,
        content: data.content?.substring(0, 100)
      })
      
      let fixed = data.content?.replace(/<[^>]*>/g, '').replace(/^["'\s]+|["'\s]+$/g, '').trim() || ''
      
      // Pad if too short
      if (fixed.length < 120) {
        fixed += ' Read the complete analysis and insights.'
      }
      // Trim if too long
      if (fixed.length > 160) {
        fixed = fixed.substring(0, 157) + '...'
      }
      
      if (fixed.length < 50) {
        console.warn('⚠️ Generated excerpt too short, keeping original')
        return excerpt
      }
      
      console.log('✅ Fixed excerpt:', fixed)
      return fixed
    } catch (error) {
      console.error('❌ Excerpt fix error:', error)
      return excerpt
    }
  }

  const findFocusKeyword = async (ttl: string, cnt: string): Promise<string> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, ' ').trim().substring(0, 500)
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `TASK: Find the MAIN SEO keyword for this article.

TITLE: "${ttl}"
CONTENT: "${plainContent}"

YOUR JOB:
- Extract 2-4 words that best describe the main topic
- This is what people would search for
- Use lowercase
- Be specific

EXAMPLES:
- "artificial intelligence"
- "climate change policy"  
- "business strategy"

RETURN: Just the keyword phrase, nothing else.`,
          action: 'generate',
          language: 'english'
        })
      })

      const data = await response.json()
      return data.content.replace(/<[^>]*>/g, '').replace(/^["'\s]+|["'\s]+$/g, '').toLowerCase().trim()
    } catch (error) {
      return ttl.toLowerCase().split(' ').slice(0, 3).join(' ')
    }
  }

  const fixContent = async (cnt: string, keyword: string, issues: string[]): Promise<string> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, '\n').trim()
      
      console.log('🔧 Fixing content...')
      console.log('Original length:', cnt.length)
      console.log('Keyword:', keyword)
      console.log('Issues:', issues)
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: plainContent, // Pass original content
          prompt: `Fix the content structure for better SEO. Add 2-3 <h2> headings, 3-5 <h3> subheadings, include the keyword "${keyword}" naturally 6-8 times, wrap text in <p> tags, use <strong> for important terms. Keep ALL original information. Don't add links or URLs. Return complete HTML content with proper structure.`,
          action: 'enhance',
          language: 'english'
        })
      })

      const data = await response.json()
      console.log('✅ API Response:', {
        success: data.success,
        contentLength: data.content?.length || 0,
        preview: data.content?.substring(0, 200)
      })
      
      if (!data.content || data.content.length < 100) {
        console.warn('⚠️ API returned short/empty content, keeping original')
        return cnt
      }
      
      return data.content.trim()
    } catch (error) {
      console.error('❌ Content fix error:', error)
      return cnt
    }
  }

  const fixTags = async (ttl: string, cnt: string, cat: string): Promise<string[]> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, ' ').trim().substring(0, 500)
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `TASK: Generate SEO tags for this article.

TITLE: "${ttl}"
CATEGORY: ${cat}
CONTENT: "${plainContent}"

YOUR JOB:
- Create exactly 5-7 tags
- Mix of specific and broad keywords
- 2-4 words per tag
- Relevant to the content

RETURN: Comma-separated tags only. Example: artificial intelligence, tech innovation, future trends, AI development, machine learning`,
          action: 'tags',
          language: 'english'
        })
      })

      const data = await response.json()
      const tagsText = data.content.replace(/<[^>]*>/g, '').replace(/^["'\s]+|["'\s]+$/g, '').trim()
      const tagsArray = tagsText.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0).slice(0, 7)
      
      return tagsArray.length >= 3 ? tagsArray : [cat.toLowerCase(), 'breaking news', 'analysis', 'latest news', 'trending']
    } catch (error) {
      return [cat.toLowerCase(), 'breaking news', 'analysis']
    }
  }

  const optimizeTitle = async (currentTitle: string, cat: string): Promise<string> => {
    try {
      // Strip HTML from content for context
      const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1000)
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert SEO specialist. Optimize this article title for maximum search visibility.

ARTICLE CONTEXT:
Title: "${currentTitle}"
Category: ${cat}
Content Preview: "${plainContent.substring(0, 300)}..."

REQUIREMENTS:
1. Length: Exactly 40-60 characters
2. Include the main keyword from the content
3. Make it compelling and click-worthy
4. Use journalistic style (not clickbait)
5. Clear and descriptive

OUTPUT: Return ONLY the optimized title text, nothing else. No quotes, no explanation.`,
          action: 'headline',
          language: 'english'
        })
      })

      const data = await response.json()
      let optimized = data.content
        .replace(/<[^>]*>/g, '')
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .trim()
      
      // Ensure it's within character limit
      if (optimized.length > 60) {
        optimized = optimized.substring(0, 57) + '...'
      } else if (optimized.length < 40) {
        // If too short, keep original
        return currentTitle
      }
      
      return optimized
    } catch (error) {
      console.error('Title optimization error:', error)
      return currentTitle
    }
  }

  const optimizeExcerpt = async (ttl: string, cnt: string, cat: string): Promise<string> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert SEO copywriter. Write a compelling meta description for this article.

ARTICLE CONTEXT:
Title: "${ttl}"
Category: ${cat}
Full Content: "${plainContent.substring(0, 800)}"

REQUIREMENTS:
1. Length: Exactly 120-160 characters (STRICT)
2. Include main keyword from the article
3. Make readers want to click
4. Summarize the key benefit/information
5. Use active voice
6. End with a call-to-action or compelling statement

OUTPUT: Return ONLY the meta description text (120-160 chars), nothing else. No quotes, no explanation.`,
          action: 'excerpt',
          language: 'english'
        })
      })

      const data = await response.json()
      let optimized = data.content
        .replace(/<[^>]*>/g, '')
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .trim()
      
      // Ensure character limit
      if (optimized.length < 120) {
        // Pad with generic call to action
        optimized += ' Read the full analysis and expert insights.'
      }
      if (optimized.length > 160) {
        optimized = optimized.substring(0, 157) + '...'
      }
      
      return optimized
    } catch (error) {
      console.error('Excerpt optimization error:', error)
      return excerpt || ttl.substring(0, 160)
    }
  }

  const extractFocusKeyword = async (ttl: string, cnt: string): Promise<string> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an SEO keyword specialist. Extract the PRIMARY focus keyword for this article.

ARTICLE CONTEXT:
Title: "${ttl}"
Content: "${plainContent.substring(0, 800)}"

REQUIREMENTS:
1. 2-4 words maximum
2. The MAIN topic of the article
3. What people would search for
4. Lowercase format
5. Most relevant SEO keyword

EXAMPLES:
- "artificial intelligence"
- "climate change"
- "business strategy"
- "india elections"
- "technology trends"

OUTPUT: Return ONLY the keyword phrase, nothing else. No quotes, no explanation.`,
          action: 'generate',
          language: 'english'
        })
      })

      const data = await response.json()
      const keyword = data.content
        .replace(/<[^>]*>/g, '')
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .toLowerCase()
        .trim()
      
      return keyword
    } catch (error) {
      console.error('Keyword extraction error:', error)
      // Fallback: extract from title
      return ttl.toLowerCase().split(' ').slice(0, 3).join(' ')
    }
  }

  const optimizeContent = async (cnt: string, keyword: string, cat: string): Promise<string> => {
    try {
      // Extract existing content without HTML
      const plainContent = cnt.replace(/<[^>]*>/g, '\n').replace(/\s+/g, ' ').trim()
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an expert SEO content editor. Enhance this article for optimal search engine performance while preserving all information.

ARTICLE CONTEXT:
Category: ${cat}
Focus Keyword: "${keyword}"
Original Content: 
${plainContent}

YOUR TASK - Enhance the content by:
1. Add 2-4 <h2> subheadings to break up the content
2. Add 3-6 <h3> subheadings under the H2s
3. Naturally include the focus keyword "${keyword}" 6-10 times throughout
4. Wrap all paragraphs in <p> tags
5. Use <strong> for important terms
6. Keep ALL original information and facts
7. Maintain the same writing style and tone
8. DO NOT add external links or URLs
9. DO NOT change the core message
10. Output valid HTML only

IMPORTANT: Return the COMPLETE enhanced content with proper HTML structure. Include everything, don't truncate.

OUTPUT FORMAT:
<h2>First Main Section</h2>
<p>Content with <strong>keyword</strong> naturally included...</p>
<h3>Subsection 1.1</h3>
<p>More content...</p>
<h2>Second Main Section</h2>
<p>Continue the article...</p>`,
          action: 'enhance',
          language: 'english'
        })
      })

      const data = await response.json()
      return data.content.trim()
    } catch (error) {
      console.error('Content optimization error:', error)
      return cnt
    }
  }

  const generateTags = async (ttl: string, cnt: string, cat: string): Promise<string[]> => {
    try {
      const plainContent = cnt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an SEO tag specialist. Generate optimal tags for this article.

ARTICLE CONTEXT:
Title: "${ttl}"
Category: ${cat}
Content: "${plainContent.substring(0, 800)}"

REQUIREMENTS:
1. Generate exactly 5-7 tags
2. Mix of broad and specific keywords
3. 2-4 words per tag
4. Highly relevant to content
5. Good search volume potential
6. Use proper capitalization

EXAMPLES:
- "Artificial Intelligence"
- "Business Strategy"
- "Climate Change"
- "Technology Trends"
- "Market Analysis"

OUTPUT: Return tags as comma-separated list ONLY. No numbering, no explanation.
Example: artificial intelligence, AI technology, machine learning, tech innovation, future tech`,
          action: 'tags',
          language: 'english'
        })
      })

      const data = await response.json()
      const tagsText = data.content
        .replace(/<[^>]*>/g, '')
        .replace(/^["'\s]+|["'\s]+$/g, '')
        .trim()
      
      const tagsArray = tagsText
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0 && t.length < 50)
        .slice(0, 7)
      
      return tagsArray.length > 0 ? tagsArray : [cat.toLowerCase(), 'breaking news', 'analysis']
    } catch (error) {
      console.error('Tag generation error:', error)
      return tags.length > 0 ? tags : [cat.toLowerCase(), 'news', 'breaking news']
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleAnalyze}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <span className="text-xl">🚀</span>
        <span>AI SEO Optimizer</span>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => !isOptimizing && setIsOpen(false)} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🚀</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">AI SEO Optimizer</h2>
                  <p className="text-xs sm:text-sm text-blue-100">Powered by NVIDIA AI</p>
                </div>
              </div>
              {!isOptimizing && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Step 1: Check SEO Score (Before Analysis) */}
            {!hasCheckedScore && !analysis && (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-4">
                  Check Your SEO Score
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                  Let's analyze your article and see how well it's optimized for search engines. 
                  We'll check title, content, keywords, and more.
                </p>
                <button
                  onClick={handleCheckScore}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                >
                  <span className="text-2xl">🔍</span>
                  <span className="text-lg">Analyze SEO Score</span>
                </button>
              </div>
            )}

            {/* Step 2: Show Results & Optimization (After Analysis) */}
            {hasCheckedScore && analysis && (
              <>
                {/* SEO Score Cards */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Initial Score */}
                    <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 rounded-xl p-4 border-2 border-neutral-300 dark:border-neutral-600">
                      <div className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                        Initial Score
                      </div>
                      <div className="flex items-end gap-2">
                        <span className={`text-4xl sm:text-5xl font-black ${
                          initialScore >= 80 ? 'text-green-600' :
                          initialScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {initialScore}
                        </span>
                        <span className="text-lg sm:text-xl text-neutral-500 pb-1">/100</span>
                      </div>
                    </div>

                    {/* Current Score */}
                    <div className={`rounded-xl p-4 border-2 transition-all duration-500 ${
                      analysis.score >= 80 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-400' 
                        : analysis.score >= 60 
                        ? 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-400' 
                        : 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border-red-400'
                    }`}>
                      <div className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <span>Current Score</span>
                        {analysis.score > initialScore && (
                          <span className="text-green-600 animate-bounce">↑</span>
                        )}
                      </div>
                      <div className="flex items-end gap-2">
                        <span className={`text-4xl sm:text-5xl font-black transition-all duration-500 ${
                          analysis.score >= 80 ? 'text-green-600' :
                          analysis.score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {analysis.score}
                        </span>
                        <span className="text-lg sm:text-xl text-neutral-500 pb-1">/100</span>
                      </div>
                      {analysis.score > initialScore && (
                        <div className="mt-2 text-xs font-bold text-green-600 animate-pulse">
                          +{analysis.score - initialScore} points improved! 🎉
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Issues with Fixed Status */}
                  {analysis.issues.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span>⚠️ Issues Found</span>
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full text-xs">
                          {analysis.issues.filter((i: any) => !fixedIssues.includes(i.type)).length}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {analysis.issues.map((issue: any, idx: number) => {
                          const isFixed = fixedIssues.includes(issue.type)
                          return (
                            <div 
                              key={idx} 
                              className={`p-3 rounded-lg border-l-4 transition-all duration-500 ${
                                isFixed 
                                  ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500' 
                                  : issue.severity === 'critical' 
                                  ? 'bg-red-50 border-red-500 dark:bg-red-900/20' 
                                  : issue.severity === 'high' 
                                  ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' 
                                  : issue.severity === 'medium' 
                                  ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20' 
                                  : 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {isFixed ? (
                                  <span className="text-green-600 text-lg flex-shrink-0 animate-bounce">✅</span>
                                ) : (
                                  <span className={`text-lg flex-shrink-0 ${
                                    issue.severity === 'critical' ? '🔴' :
                                    issue.severity === 'high' ? '🟠' :
                                    issue.severity === 'medium' ? '🟡' : '🔵'
                                  }`}>
                                    {issue.severity === 'critical' ? '🔴' :
                                     issue.severity === 'high' ? '🟠' :
                                     issue.severity === 'medium' ? '🟡' : '🔵'}
                                  </span>
                                )}
                                <div className="flex-1">
                                  <p className={`text-sm font-semibold transition-all ${
                                    isFixed 
                                      ? 'text-green-800 dark:text-green-200 line-through' 
                                      : 'text-neutral-900 dark:text-white'
                                  }`}>
                                    {issue.message}
                                  </p>
                                  {isFixed && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-bold">
                                      ✓ Fixed by AI
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Passes */}
                  {analysis.passes.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-300 dark:border-green-700">
                      <h4 className="text-sm font-bold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span>✓ Passed Checks</span>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">
                          {analysis.passes.length}
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {analysis.passes.map((pass: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{pass}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Optimization Status */}
                {optimizing && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-200 block">
                          {optimizing}
                        </span>
                        <span className="text-xs text-blue-700 dark:text-blue-300">
                          Please wait, AI is working...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-Optimize Button */}
                {analysis.issues.length > 0 && !isOptimizing && (
                  <div className="mb-6">
                    <button
                      onClick={handleAutoOptimize}
                      disabled={isOptimizing}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                    >
                      <span className="text-2xl">✨</span>
                      <div className="text-left">
                        <div className="text-base sm:text-lg">Auto-Optimize Everything</div>
                        <div className="text-xs text-green-100">AI will fix all {analysis.issues.length} issues automatically</div>
                      </div>
                    </button>
                    
                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 border-t-2 border-neutral-300 dark:border-neutral-600"></div>
                      <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">OR OPTIMIZE INDIVIDUALLY</span>
                      <div className="flex-1 border-t-2 border-neutral-300 dark:border-neutral-600"></div>
                    </div>

                    {/* Individual Optimization Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Optimize Title */}
                      <button
                        onClick={handleOptimizeTitle}
                        disabled={isOptimizing}
                        className={`px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 ${
                          fixedIssues.includes('title')
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-400'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                        } ${optimizingItem === 'title' ? 'animate-pulse' : ''}`}
                      >
                        {fixedIssues.includes('title') ? (
                          <>
                            <span className="text-xl">✅</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Title Optimized</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">📝</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Optimize Title</div>
                              <div className="text-xs opacity-80">40-60 chars</div>
                            </div>
                          </>
                        )}
                      </button>

                      {/* Optimize Excerpt */}
                      <button
                        onClick={handleOptimizeExcerpt}
                        disabled={isOptimizing}
                        className={`px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 ${
                          fixedIssues.includes('excerpt')
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-400'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                        } ${optimizingItem === 'excerpt' ? 'animate-pulse' : ''}`}
                      >
                        {fixedIssues.includes('excerpt') ? (
                          <>
                            <span className="text-xl">✅</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Excerpt Optimized</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">📄</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Optimize Excerpt</div>
                              <div className="text-xs opacity-80">120-160 chars</div>
                            </div>
                          </>
                        )}
                      </button>

                      {/* Optimize Content */}
                      <button
                        onClick={handleOptimizeContent}
                        disabled={isOptimizing}
                        className={`px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 ${
                          fixedIssues.includes('content_structure')
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-400'
                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                        } ${optimizingItem === 'content' ? 'animate-pulse' : ''}`}
                      >
                        {fixedIssues.includes('content_structure') ? (
                          <>
                            <span className="text-xl">✅</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Content Optimized</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">📰</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Optimize Content</div>
                              <div className="text-xs opacity-80">Structure & headings</div>
                            </div>
                          </>
                        )}
                      </button>

                      {/* Optimize Tags */}
                      <button
                        onClick={handleOptimizeTags}
                        disabled={isOptimizing}
                        className={`px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 ${
                          fixedIssues.includes('tags')
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-400'
                            : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700'
                        } ${optimizingItem === 'tags' ? 'animate-pulse' : ''}`}
                      >
                        {fixedIssues.includes('tags') ? (
                          <>
                            <span className="text-xl">✅</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Tags Optimized</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">🏷️</span>
                            <div className="text-left flex-1">
                              <div className="text-sm">Optimize Tags</div>
                              <div className="text-xs opacity-80">5-7 tags</div>
                            </div>
                          </>
                        )}
                      </button>

                      {/* Extract Keyword - Full Width */}
                      <button
                        onClick={handleOptimizeKeyword}
                        disabled={isOptimizing}
                        className={`px-4 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 sm:col-span-2 ${
                          optimizingItem === 'keyword'
                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white animate-pulse'
                            : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700'
                        }`}
                      >
                        <span className="text-xl">🎯</span>
                        <div className="text-left flex-1">
                          <div className="text-sm">Extract Focus Keyword</div>
                          <div className="text-xs opacity-80">Find main SEO keyword</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {analysis.issues.length === 0 && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-400 text-center">
                    <div className="text-4xl mb-3 animate-bounce">🎉</div>
                    <h3 className="text-xl font-black text-green-700 dark:text-green-300 mb-2">
                      Perfect SEO Score!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Your article is fully optimized and ready to rank high in search results!
                    </p>
                  </div>
                )}

                {/* What Will Be Optimized - Info Box */}
                {!isOptimizing && (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <span>💡</span>
                      <span>Tip: Click any button above to optimize that specific section</span>
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Each optimization will update your score in real-time. Use "Auto-Optimize Everything" to fix all issues at once, or pick individual sections to optimize as needed.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Sticky */}
          <div className="bg-neutral-100 dark:bg-neutral-700 p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-600">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <span>💡</span>
                <span>Review AI suggestions before publishing</span>
              </span>
              {!isOptimizing && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-600 hover:bg-neutral-300 dark:hover:bg-neutral-500 rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
