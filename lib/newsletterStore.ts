import fs from 'fs'
import path from 'path'
import { isD1Configured, queryD1, executeD1 } from './d1'
import { cloudGet, cloudPut, CLOUD_KEYS } from './backend/cloudStore'

export interface NewsletterSubscription {
  id: string
  email: string
  subscribedAt: string
  active: boolean
  source?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_FILE = path.join(DATA_DIR, 'newsletter_subscriptions.json')

let memorySubscriptions: NewsletterSubscription[] | null = null

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    } catch {}
  }
}

function loadFromDisk(): NewsletterSubscription[] {
  ensureDataDir()
  if (fs.existsSync(LOCAL_FILE)) {
    try {
      const raw = fs.readFileSync(LOCAL_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    } catch (err) {
      console.warn('Could not read newsletter subscriptions from disk:', err)
    }
  }
  return []
}

function saveToDisk(subs: NewsletterSubscription[]): void {
  ensureDataDir()
  try {
    const tempPath = path.join(DATA_DIR, '.newsletter_subscriptions.' + Date.now() + '.tmp')
    fs.writeFileSync(tempPath, JSON.stringify(subs, null, 2), 'utf-8')
    fs.renameSync(tempPath, LOCAL_FILE)
  } catch (err) {
    console.warn('Non-fatal: could not save newsletter subscriptions to disk:', err)
  }
}

export async function getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
  if (memorySubscriptions) {
    return memorySubscriptions
  }

  // 1. Try cloud
  try {
    const cloudSubs = await cloudGet<NewsletterSubscription[]>(CLOUD_KEYS.NEWSLETTER_SUBSCRIPTIONS)
    if (Array.isArray(cloudSubs) && cloudSubs.length > 0) {
      memorySubscriptions = cloudSubs
      saveToDisk(cloudSubs)
      return cloudSubs
    }
  } catch (err) {
    console.warn('Could not fetch newsletter subscriptions from cloud:', err)
  }

  // 2. Fallback to disk
  const diskSubs = loadFromDisk()
  memorySubscriptions = diskSubs
  return diskSubs
}

export async function addNewsletterSubscription(email: string, source = 'homepage_sidebar'): Promise<{ success: boolean; isNew: boolean }> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Invalid email address')
  }

  const existing = await getAllNewsletterSubscriptions()
  const found = existing.find((s) => s.email.toLowerCase() === cleanEmail)
  if (found) {
    return { success: true, isNew: false }
  }

  const newSub: NewsletterSubscription = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    active: true,
    source,
  }

  const updated = [newSub, ...existing]
  memorySubscriptions = updated
  saveToDisk(updated)

  try {
    await cloudPut(CLOUD_KEYS.NEWSLETTER_SUBSCRIPTIONS, updated)
  } catch (err) {
    console.warn('Non-fatal: could not persist newsletter subscription to cloud:', err)
  }

  // Persist to D1 if configured
  if (isD1Configured()) {
    try {
      await executeD1(
        'INSERT INTO newsletter_subscriptions (id, email, created_at, active) VALUES (?, ?, ?, 1)',
        [newSub.id, newSub.email, newSub.subscribedAt]
      )
    } catch (err) {
      // Table may not exist in standard migrations, ignore non-fatal
    }
  }

  return { success: true, isNew: true }
}
