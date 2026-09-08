import fs from 'fs'
import path from 'path'
import { isD1Configured, queryD1, executeD1 } from './d1'

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

const DATA_DIR = path.join(process.cwd(), 'data')
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push_subscriptions.json')

function ensureFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2), 'utf-8')
    }
  } catch {}
}

export function getAllPushSubscriptions(): PushSubscriptionRecord[] {
  ensureFile()
  try {
    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8')
    return JSON.parse(raw) as PushSubscriptionRecord[]
  } catch (e) {
    return []
  }
}

export async function getAllPushSubscriptionsAsync(): Promise<PushSubscriptionRecord[]> {
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
        return rows.map((r) => ({
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
      }
    } catch (e) {
      console.error('Error fetching subscriptions from D1:', e)
    }
  }
  return getAllPushSubscriptions()
}

export async function savePushSubscription(sub: {
  endpoint: string
  expirationTime?: number | null
  keys: { p256dh: string; auth: string }
  userAgent?: string
  platform?: string
}): Promise<{ success: boolean; isNew: boolean; count: number }> {
  // 1. Save to D1 if configured
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
      console.error('Non-fatal: Error persisting push subscription to D1:', err)
    }
  }

  // 2. Also keep in local file/memory
  ensureFile()
  try {
    const subs = getAllPushSubscriptions()
    const existingIndex = subs.findIndex((s) => s.endpoint === sub.endpoint)

    if (existingIndex >= 0) {
      subs[existingIndex] = {
        ...subs[existingIndex],
        keys: sub.keys,
        userAgent: sub.userAgent || subs[existingIndex].userAgent,
        platform: sub.platform || subs[existingIndex].platform,
      }
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8')
      return { success: true, isNew: false, count: subs.length }
    } else {
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
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subs, null, 2), 'utf-8')
      return { success: true, isNew: true, count: subs.length }
    }
  } catch (e) {
    return { success: true, isNew: true, count: 1 }
  }
}

export async function removePushSubscription(endpoint: string): Promise<boolean> {
  if (isD1Configured()) {
    try {
      await executeD1('DELETE FROM push_subscriptions WHERE endpoint = ?', [endpoint])
    } catch (e) {
      console.error('Error removing from D1:', e)
    }
  }

  ensureFile()
  try {
    const subs = getAllPushSubscriptions()
    const filtered = subs.filter((s) => s.endpoint !== endpoint)
    if (filtered.length !== subs.length) {
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(filtered, null, 2), 'utf-8')
      return true
    }
    return false
  } catch (e) {
    return false
  }
}
