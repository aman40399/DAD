import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Article } from '@/types'
import { localStore } from './localStore'
import fs from 'fs'
import path from 'path'


const ARTICLES_R2_KEY = 'database/articles.json'

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || ''
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || ''
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'

  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
    return { client, bucketName }
  }
  return null
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  )
}

// Global in-memory cache to make reads instantaneous
declare global {
  var __r2_articles_cache__: { articles: Article[]; timestamp: number } | undefined
}

const CACHE_TTL_MS = 30000 // 30 seconds

export function invalidateR2Cache(): void {
  global.__r2_articles_cache__ = undefined
}

/**
 * Load bundled articles from local disk as seed/fallback
 */
function getBundledArticles(): Article[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles.json')
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (err) {
    console.error('Failed to read bundled articles:', err)
  }
  return []
}

/**
 * Sync articles to local disk (for dev convenience & offline fallback)
 */
function syncToLocalDisk(articles: Article[]): void {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    const filePath = path.join(dataDir, 'articles.json')
    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf-8')
  } catch {}
}

/**
 * Fetch all articles from Cloudflare R2 persistent storage.
 * Automatically seeds R2 if the file does not exist yet.
 */
export async function loadArticlesFromR2(): Promise<Article[]> {
  // Check hot in-memory cache first
  const now = Date.now()
  if (global.__r2_articles_cache__ && (now - global.__r2_articles_cache__.timestamp) < CACHE_TTL_MS) {
    return global.__r2_articles_cache__.articles
  }

  const r2 = getR2Client()
  if (!r2) {
    console.warn('⚠️ Cloudflare R2 credentials not configured, reading from disk fallback.')
    return getBundledArticles()
  }

  try {
    const res = await r2.client.send(
      new GetObjectCommand({
        Bucket: r2.bucketName,
        Key: ARTICLES_R2_KEY,
      })
    )

    const raw = await res.Body?.transformToString()
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.__r2_articles_cache__ = { articles: parsed, timestamp: now }
        syncToLocalDisk(parsed)
        try { localStore.setAll(parsed) } catch {}
        return parsed
      }
    }
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.Code === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      console.log('⚡ database/articles.json not found in R2. Seeding R2 from bundled articles...')
      const bundled = getBundledArticles()
      if (bundled.length > 0) {
        await saveArticlesToR2(bundled)
        return bundled
      }
    } else {
      console.error('⚠️ Error fetching articles from Cloudflare R2:', err)
    }
  }

  // Fallback to disk if R2 read encountered temporary network failure
  const diskArticles = getBundledArticles()
  if (diskArticles.length > 0) {
    global.__r2_articles_cache__ = { articles: diskArticles, timestamp: now }
  }
  return diskArticles
}

/**
 * Save updated article list to Cloudflare R2 persistent storage.
 */
export async function saveArticlesToR2(articles: Article[]): Promise<boolean> {
  // 1. Immediately update in-memory cache
  global.__r2_articles_cache__ = {
    articles: [...articles],
    timestamp: Date.now(),
  }

  // 2. Sync to local disk for offline continuity
  syncToLocalDisk(articles)

  // 3. Write directly to Cloudflare R2
  const r2 = getR2Client()
  if (!r2) {
    console.warn('⚠️ Cloudflare R2 not configured, only saved to local disk.')
    return false
  }

  try {
    const payload = JSON.stringify(articles, null, 2)
    await r2.client.send(
      new PutObjectCommand({
        Bucket: r2.bucketName,
        Key: ARTICLES_R2_KEY,
        Body: payload,
        ContentType: 'application/json',
        CacheControl: 'no-cache, no-store, must-revalidate',
      })
    )
    console.log(`✅ Successfully saved ${articles.length} articles to Cloudflare R2 (${ARTICLES_R2_KEY})`)
    return true
  } catch (err) {
    console.error('❌ Failed to save articles to Cloudflare R2:', err)
    return false
  }
}
