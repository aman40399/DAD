import { isD1Configured, queryD1, executeD1 } from './d1'
import { cloudGet, cloudPut, CLOUD_KEYS } from './backend/cloudStore'

export interface PushSubscriptionRecord {
  id: string
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
  platform?: string
  subscribedAt: string
  lastNotifiedAt?: string
}

// In-memory cache for fast access
let memorySubscriptions: PushSubscriptionRecord[] | null = null

export async function getAllPushSubscriptionsAsync(): Promise<PushSubscriptionRecord[]> {
  if (memorySubscriptions) {
    return memorySubscriptions
  }

  // 1. Try reading from Cloud Store (R2)
  try {
    const cloudSubs = await cloudGet<PushSubscriptionRecord[]>(CLOUD_KEYS.PUSH_SUBSCRIPTIONS)
    if (Array.isArray(cloudSubs)) {
      memorySubscriptions = cloudSubs
      return cloudSubs
    }
  } catch (err) {
    console.error('Error fetching subscriptions from CloudStore:', err)
  }

  // 2. Try reading from D1 if configured
  if (isD1Configured()) {
    try {
      const rows = await queryD1<{
        id: string
        endpoint: string
        p256dh: string
        auth: string
        user_agent: string
        platform: string
        created_at: string
      }>('SELECT id, endpoint, p256dh, auth, user_agent, platform, created_at FROM push_subscriptions')

      if (Array.isArray(rows) && rows.length > 0) {
        const subs = rows.map((r) => ({
          id: r.id,
          endpoint: r.endpoint,
          keys: {
            p256dh: r.p256dh,
            auth: r.auth,
          },
          userAgent: r.user_agent,
          platform: r.platform,
          subscribedAt: r.created_at || new Date().toISOString(),
        }))
        memorySubscriptions = subs
        await cloudPut(CLOUD_KEYS.PUSH_SUBSCRIPTIONS, subs)
        return subs
      }
    } catch (e) {
      console.error('Error fetching subscriptions from D1:', e)
    }
  }

  memorySubscriptions = []
  return []
}

export function getAllPushSubscriptions(): PushSubscriptionRecord[] {
  return memorySubscriptions || []
}

export async function savePushSubscription(sub: {
  endpoint: string
  expirationTime?: number | null
  keys: { p256dh: string; auth: string }
  userAgent?: string
  platform?: string
}): Promise<{ success: boolean; isNew: boolean; count: number }> {
  const subs = await getAllPushSubscriptionsAsync()
  const existingIndex = subs.findIndex((s) => s.endpoint === sub.endpoint)
  let isNew = false

  if (existingIndex >= 0) {
    subs[existingIndex] = {
      ...subs[existingIndex],
      keys: sub.keys,
      userAgent: sub.userAgent || subs[existingIndex].userAgent,
      platform: sub.platform || subs[existingIndex].platform,
    }
  } else {
    isNew = true
    const record: PushSubscriptionRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime,
      keys: sub.keys,
      userAgent: sub.userAgent,
      platform: sub.platform,
      subscribedAt: new Date().toISOString(),
    }
    subs.push(record)
  }

  memorySubscriptions = subs
  await cloudPut(CLOUD_KEYS.PUSH_SUBSCRIPTIONS, subs)

  // Also mirror to D1 if configured
  if (isD1Configured()) {
    try {
      const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const now = new Date().toISOString()
      await executeD1(
        `INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, user_agent, platform, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(endpoint) DO UPDATE SET
           p256dh = excluded.p256dh,
           auth = excluded.auth,
           user_agent = excluded.user_agent,
           platform = excluded.platform`,
        [id, sub.endpoint, sub.keys.p256dh, sub.keys.auth, sub.userAgent || '', sub.platform || '', now]
      )
    } catch (err) {
      // Non-fatal
    }
  }

  return { success: true, isNew, count: subs.length }
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  const subs = await getAllPushSubscriptionsAsync()
  const filtered = subs.filter((s) => s.endpoint !== endpoint)
  if (filtered.length !== subs.length) {
    memorySubscriptions = filtered
    await cloudPut(CLOUD_KEYS.PUSH_SUBSCRIPTIONS, filtered)

    if (isD1Configured()) {
      try {
        await executeD1('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint])
      } catch (e) {
        // Non-fatal
      }
    }
    return true
  }
  return false
}
