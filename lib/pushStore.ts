import fs from 'fs'
import path from 'path'

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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(SUBSCRIPTIONS_FILE)) {
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify([], null, 2), 'utf-8')
  }
}

export function getAllPushSubscriptions(): PushSubscriptionRecord[] {
  ensureFile()
  try {
    const raw = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8')
    return JSON.parse(raw) as PushSubscriptionRecord[]
  } catch (e) {
    console.error('Error reading push_subscriptions.json:', e)
    return []
  }
}

export function savePushSubscription(sub: {
  endpoint: string
  expirationTime?: number | null
  keys: { p256dh: string; auth: string }
  userAgent?: string
  platform?: string
}): { success: boolean; isNew: boolean; count: number } {
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
    console.error('Error saving push subscription:', e)
    return { success: false, isNew: false, count: 0 }
  }
}

export function removePushSubscription(endpoint: string): boolean {
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
    console.error('Error removing push subscription:', e)
    return false
  }
}
