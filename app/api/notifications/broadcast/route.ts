import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import {
  getAllPushSubscriptions,
  removePushSubscription,
} from '@/lib/pushStore'
import {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT,
} from '@/lib/pushConfig'

export const dynamic = 'force-dynamic'

// Configure web-push with VAPID details
try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
} catch (e) {
  console.error('Failed to configure web-push VAPID details:', e)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title = 'Singh Monster — Breaking News',
      message = 'A new critical report has been published by Dhananjay Singh.',
      url = '/',
      imageUrl,
      isBreaking = false,
      tag = 'singh-monster-broadcast',
    } = body

    const subscriptions = getAllPushSubscriptions()

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active device subscriptions registered yet',
        sentCount: 0,
        failedCount: 0,
        totalSubscribers: 0,
      })
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url,
      imageUrl,
      isBreaking,
      tag,
      icon: '/authr.png',
      badge: '/authr.png',
    })

    let sentCount = 0
    let failedCount = 0
    const deadEndpoints: string[] = []

    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        }

        try {
          await webpush.sendNotification(pushSubscription, payload, {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: isBreaking ? 'high' : 'normal',
          })
          sentCount++
        } catch (err: any) {
          failedCount++
          // If status is 404 or 410, subscription has expired or unsubscribed
          if (err.statusCode === 404 || err.statusCode === 410) {
            deadEndpoints.push(sub.endpoint)
          }
        }
      })
    )

    // Cleanup dead subscriptions
    for (const deadEndpoint of deadEndpoints) {
      removePushSubscription(deadEndpoint)
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      cleanedCount: deadEndpoints.length,
      totalSubscribers: subscriptions.length - deadEndpoints.length,
    })
  } catch (error) {
    console.error('Error in /api/notifications/broadcast:', error)
    return NextResponse.json(
      { success: false, error: 'Broadcast dispatch failed' },
      { status: 500 }
    )
  }
}
