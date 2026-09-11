import { NextRequest, NextResponse } from 'next/server'
import { addNewsletterSubscription, getAllNewsletterSubscriptions } from '@/lib/newsletterStore'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email, source } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    const result = await addNewsletterSubscription(email, source || 'web_reader')
    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully to Singh Monster Daily Dispatches',
      isNew: result.isNew,
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Subscription failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const subs = await getAllNewsletterSubscriptions()
  return NextResponse.json({
    success: true,
    count: subs.length,
  })
}
