import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// NVIDIA NIM API endpoint
// For API keys from build.nvidia.com, use this endpoint
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

// Base system prompt for journalism
const JOURNALISM_SYSTEM_PROMPT = `You are an expert journalist and content writer for a major newspaper publication. 
Your writing should be:
- Professional, clear, and engaging
- Well-structured with proper headings and paragraphs
- Factual and informative
- Written in an authoritative but accessible tone
- Formatted in clean, semantic HTML

Always write in HTML format using:
- <h2> for main headings (NOT h1)
- <h3> for subheadings
- <p> for paragraphs
- <strong> for emphasis/bold text
- <em> for italics or subtle emphasis
- <ul> and <li> for bullet lists
- <ol> and <li> for numbered lists
- <blockquote> for important quotes or callouts

IMPORTANT: 
- Output ONLY the HTML content, no markdown syntax
- Do NOT use # or ## or *** for formatting
- Use proper HTML tags like <h2>, <p>, <strong>, <ul>, <li>
- Make sure headings are properly sized (h2 > h3 > p)
- Always close your HTML tags properly
- When writing in Hindi, write COMPLETE and COMPREHENSIVE content with full details
- For Hindi content, provide LONGER and MORE DETAILED responses with multiple paragraphs
- Do NOT truncate or shorten Hindi content - write full, complete articles

Focus on creating compelling news articles, features, and editorial content.`

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { prompt, action, content, language = 'english', temperature = 0.7, maxTokens = 2000 } = body

    if (!prompt && !content) {
      return NextResponse.json({ error: 'Prompt or content required' }, { status: 400 })
    }

    // Language instruction
    const languageInstruction = language === 'hindi' 
      ? '\n\nIMPORTANT: Write the ENTIRE response in Hindi (Devanagari script). Provide COMPLETE, COMPREHENSIVE, and DETAILED content. Write LONG paragraphs with full information. Do NOT truncate or shorten the content. Write at least 500-800 words for articles.'
      : '\n\nWrite in English.'

    // Build the user prompt based on action
    let userPrompt = ''
    
    // Combine system prompt with user request for better results
    const fullInstruction = `${JOURNALISM_SYSTEM_PROMPT}${languageInstruction}\n\nNow, ${action === 'generate' ? 'write' : 'process'} the following:\n\n`
    
    switch (action) {
      case 'generate':
        userPrompt = `${fullInstruction}Write a complete news article about: ${prompt}\n\nProvide a well-structured article with <h2> heading, multiple <p> paragraphs, and proper HTML formatting. Use <strong> for emphasis and <ul><li> for lists.${language === 'hindi' ? ' Write COMPLETE and COMPREHENSIVE content in Hindi with FULL details, at least 500-800 words.' : ''}`
        break
      
      case 'enhance':
        userPrompt = `${fullInstruction}Enhance this article content while maintaining its core message. Improve clarity, add journalistic flair, and make it more engaging:\n\n${content}\n\nOutput in clean HTML format with <h2>, <h3>, <p>, <strong> tags.${language === 'hindi' ? ' Provide DETAILED enhancement in Hindi.' : ''}`
        break
      
      case 'rewrite':
        userPrompt = `${fullInstruction}Completely rewrite this content with a fresh perspective while keeping the same facts and information:\n\n${content}\n\nOutput in HTML format using <h2>, <h3>, <p>, <strong>, <em> tags.${language === 'hindi' ? ' Write COMPLETE content in Hindi.' : ''}`
        break
      
      case 'expand':
        userPrompt = `${fullInstruction}Expand this content with more details, context, and depth. Add relevant information and examples:\n\n${content}\n\nUse HTML formatting with <h3> subheadings, <p> paragraphs, and <ul><li> lists.${language === 'hindi' ? ' Provide EXTENSIVE expansion in Hindi with FULL details.' : ''}`
        break
      
      case 'summarize':
        userPrompt = `${fullInstruction}Summarize this content into a concise, well-structured summary highlighting the key points:\n\n${content}\n\nFormat in HTML with <p> tags and <ul><li> for key points.`
        break
      
      case 'fix-grammar':
        userPrompt = `${fullInstruction}Fix grammar, spelling, and punctuation errors in this content. Maintain the original meaning and style:\n\n${content}\n\nReturn in proper HTML format with <h2>, <h3>, <p>, <strong> tags.`
        break
      
      case 'translate':
        const targetLang = language === 'hindi' ? 'Hindi (Devanagari script)' : 'English'
        userPrompt = `Translate this content to ${targetLang} while maintaining the journalistic tone and HTML formatting:\n\n${content}\n\n${language === 'hindi' ? 'Provide COMPLETE translation in Hindi with FULL details. Do NOT truncate.' : 'Provide complete translation in English.'}`
        break
      
      case 'headline':
        userPrompt = `${fullInstruction}Generate 5 compelling, SEO-optimized headlines for this article:\n\n${content}\n\nFormat each headline with <h2> tags, numbered Option 1-5.`
        break
      
      case 'excerpt':
        userPrompt = `${fullInstruction}Create a compelling 2-3 sentence excerpt/summary for this article:\n\n${content}\n\nOutput in a single <p> tag.`
        break
      
      case 'tags':
        userPrompt = `${fullInstruction}Generate 8-12 relevant tags/keywords for this article:\n\n${content}\n\nFormat as HTML list: <ul><li>tag1</li><li>tag2</li>...</ul>`
        break
      
      default:
        userPrompt = prompt || content
    }

    // Call NVIDIA API
    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA API key not configured' }, { status: 500 })
    }

    console.log('Calling NVIDIA API...')
    console.log('Model: openai/gpt-oss-120b')

    try {
      const response = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          top_p: 1,
          stream: false
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('NVIDIA API Error:', response.status, errorText)
        
        // Try to parse error for better message
        let errorMessage = errorText
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.detail || errorJson.message || errorText
        } catch {}
        
        return NextResponse.json(
          { 
            error: 'AI service error', 
            details: `Status ${response.status}: ${errorMessage}`,
            message: 'Please verify your NVIDIA API key has access to the chat completions endpoint. Get your key from https://build.nvidia.com/'
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      const generatedText = data.choices?.[0]?.message?.content || ''

      return NextResponse.json({
        success: true,
        content: generatedText.trim(),
        action: action
      })
    } catch (fetchError) {
      console.error('Fetch Error:', fetchError)
      return NextResponse.json(
        { 
          error: 'Network error', 
          details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('AI Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
