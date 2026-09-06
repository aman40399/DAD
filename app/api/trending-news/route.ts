import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const NEWS_API_KEY = '16977cbff09344f2b1407d71a36888c2'
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get('language') || 'en'
    const country = searchParams.get('country') || undefined
    const category = searchParams.get('category') || undefined
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Build NewsAPI request
    const params = new URLSearchParams({
      apiKey: NEWS_API_KEY,
      pageSize: pageSize.toString(),
      page: page.toString(),
      sortBy: 'publishedAt'
    })

    if (language) params.append('language', language)
    if (country) params.append('country', country)
    if (category) params.append('category', category)

    console.log('Fetching trending news from NewsAPI...')
    console.log('URL:', `${NEWS_API_URL}?${params.toString()}`)

    const response = await fetch(`${NEWS_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Chhkwa News App'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('NewsAPI Error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          error: 'NewsAPI error', 
          details: errorText,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform the data to match our article structure
    const articles = data.articles?.map((article: any) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      author: article.author || article.source.name,
      publishedAt: article.publishedAt,
    })) || []

    return NextResponse.json({
      success: true,
      totalResults: data.totalResults,
      articles: articles,
      page: page,
      pageSize: pageSize
    })

  } catch (error) {
    console.error('Trending News API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending news', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
