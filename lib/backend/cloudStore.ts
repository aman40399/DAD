import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export const CLOUD_KEYS = {
  ARTICLES: 'database/articles.json',
  ABOUT_CONFIG: 'database/aboutConfig.json',
  EDITORIAL_CONFIG: 'database/editorialConfig.json',
  PUSH_SUBSCRIPTIONS: 'database/push_subscriptions.json',
  ANALYTICS: 'database/analytics.json',
} as const

export type CloudKey = typeof CLOUD_KEYS[keyof typeof CLOUD_KEYS] | string

// Global cache to persist across warm serverless invocations and Next.js dev reloads
declare global {
  var __cloud_store_cache__: Map<string, { data: any; timestamp: number }> | undefined
}

if (!globalThis.__cloud_store_cache__) {
  globalThis.__cloud_store_cache__ = new Map()
}

const memoryCache = globalThis.__cloud_store_cache__

function getS3Client() {
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

export function isCloudConfigured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  )
}

export function invalidateCloudCache(key?: string): void {
  if (key) {
    memoryCache.delete(key)
  } else {
    memoryCache.clear()
  }
}

/**
 * Retrieve JSON document from cloud storage with in-memory TTL caching.
 */
export async function cloudGet<T>(key: CloudKey, ttlMs: number = 30000): Promise<T | null> {
  const now = Date.now()
  const cached = memoryCache.get(key)
  if (cached && (now - cached.timestamp) < ttlMs) {
    return cached.data as T
  }

  const s3 = getS3Client()
  if (!s3) {
    console.warn(`[CloudStore] S3/R2 credentials not configured for cloudGet(${key})`)
    return null
  }

  try {
    const res = await s3.client.send(
      new GetObjectCommand({
        Bucket: s3.bucketName,
        Key: key,
      })
    )

    const raw = await res.Body?.transformToString()
    if (!raw) return null

    const parsed = JSON.parse(raw) as T
    memoryCache.set(key, { data: parsed, timestamp: now })
    return parsed
  } catch (err: any) {
    if (err.name === 'NoSuchKey' || err.Code === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null
    }
    console.error(`[CloudStore] Error fetching key "${key}":`, err)
    // Return stale cache if available during network hiccup
    if (cached) return cached.data as T
    return null
  }
}

/**
 * Persist JSON document atomically to cloud storage and update memory cache.
 */
export async function cloudPut<T>(key: CloudKey, data: T): Promise<boolean> {
  const now = Date.now()
  // Immediate write-through cache update
  memoryCache.set(key, { data, timestamp: now })

  const s3 = getS3Client()
  if (!s3) {
    console.error(`[CloudStore] S3/R2 credentials missing, unable to persist cloudPut(${key})`)
    return false
  }

  try {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    await s3.client.send(
      new PutObjectCommand({
        Bucket: s3.bucketName,
        Key: key,
        Body: jsonStr,
        ContentType: 'application/json',
      })
    )
    return true
  } catch (err) {
    console.error(`[CloudStore] Error writing key "${key}":`, err)
    return false
  }
}

/**
 * Delete key from cloud storage and remove from memory cache.
 */
export async function cloudDelete(key: CloudKey): Promise<boolean> {
  memoryCache.delete(key)
  const s3 = getS3Client()
  if (!s3) return false

  try {
    await s3.client.send(
      new DeleteObjectCommand({
        Bucket: s3.bucketName,
        Key: key,
      })
    )
    return true
  } catch (err) {
    console.error(`[CloudStore] Error deleting key "${key}":`, err)
    return false
  }
}
