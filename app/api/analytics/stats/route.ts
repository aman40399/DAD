import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsStats, TimeRangeFilter } from '@/lib/analytics'
import { getAllArticles, getHomepageArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    // Support both timeRange and range query parameters
    const rawRange = searchParams.get('timeRange') || searchParams.get('range') || '7d'
    const validRanges: TimeRangeFilter[] = ['today', '7d', '30d', 'all']
    const timeRange = validRanges.includes(rawRange as TimeRangeFilter)
      ? (rawRange as TimeRangeFilter)
      : '7d'

    const stats = await getAnalyticsStats(timeRange)

    // Enrich with current live counts from articles store
    try {
      const articles = await getAllArticles()
      const homepage = await getHomepageArticles()
      const publishedCount = articles.filter((a) => a.status === 'published').length
      const pinnedCount = homepage.filter((a) => a.homepage_position !== null).length

      stats.publishedArticlesCount = publishedCount
      stats.activeArticles = publishedCount
      stats.pinnedSlotsCount = pinnedCount
      stats.pinnedSlots = pinnedCount
    } catch {
      // Keep defaults from analytics aggregation
    }

    // Return with backward-compatible aliases
    return NextResponse.json({
      ...stats,
      totalVisitors: stats.uniqueVisitors,
      totalPageViews: stats.totalViews,
      countries: stats.topCountries,
      viewsOverTime: stats.timeSeries,
      regionalBreakdown: stats.topCountries,
      referrerBreakdown: stats.topReferrers,
      activeArticles: stats.publishedArticlesCount,
      avgReadingTime: stats.avgReadingTimeMinutes,
      pinnedSlots: stats.pinnedSlotsCount,
    })
  } catch (error: any) {
    console.error('Analytics stats error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch analytics stats' },
      { status: 500 }
    )
  }
}

