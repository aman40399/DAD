import { NextRequest, NextResponse } from 'next/server'
import {
  getAllPushSubscriptions,
  savePushSubscription,
  removePushSubscription,
} from '@/lib/pushStore'
import { VAPID_PUBLIC_KEY } from '@/lib/pushConfig'

export const dynamic = 'force-dynamic'

export async function GET() {
  const subs = getAllPushSubscriptions()
  return NextResponse.json({
    success: true,
    count: subs.length,
    publicKey: VAPID_PUBLIC_KEY,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subscription, userAgent, platform } = body

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Invalid push subscription payload' },
        { status: 400 }
      )
    }

    const result = await savePushSubscription({
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      keys: subscription.keys,
      userAgent: userAgent || req.headers.get('user-agent') || undefined,
      platform,
    })

    return NextResponse.json({
      success: result.success,
      isNew: result.isNew,
      totalSubscribers: result.count,
    })
  } catch (error) {
    console.error('Error in /api/notifications/subscribe:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.endpoint) {
      return NextResponse.json({ success: false, error: 'Missing endpoint' }, { status: 400 })
    }

    const removed = await removePushSubscription(body.endpoint)
    return NextResponse.json({ success: true, removed })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
