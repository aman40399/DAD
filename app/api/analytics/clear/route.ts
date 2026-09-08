import { NextRequest, NextResponse } from 'next/server'
import { clearAnalyticsData } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    await clearAnalyticsData()
    return NextResponse.json({ success: true, message: 'All visitor analytics wiped clean.' })
  } catch (error: any) {
    console.error('Error clearing analytics data:', error)
    return NextResponse.json({ error: error.message || 'Failed to clear analytics' }, { status: 500 })
  }
}
