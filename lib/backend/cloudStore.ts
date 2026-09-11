import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { refreshCloudflareToken } from '../d1'

export const CLOUD_KEYS = {
  ARTICLES: 'database/articles.json',
  ABOUT_CONFIG: 'database/aboutConfig.json',
  EDITORIAL_CONFIG: 'database/editorialConfig.json',
  PUSH_SUBSCRIPTIONS: 'database/push_subscriptions.json',
  NEWSLETTER_SUBSCRIPTIONS: 'database/newsletter_subscriptions.json',
  ANALYTICS: 'database/analytics.json',
} as const

export type CloudKey = typeof CLOUD_KEYS[keyof typeof CLOUD_KEYS] | string

// Global cache to persist across warm serverless invocations and Next.js dev reloads
declare global {
  var __cloud_store_cache__: Map<string, { data: any; timestamp: number }> | undefined
}

const memoryCache: Map<string, { data: any; timestamp: number }> =
  globalThis.__cloud_store_cache__ ||
  (globalThis.__cloud_store_cache__ = new Map<string, { data: any; timestamp: number }>())

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
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const hasS3 = Boolean(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY)
  const hasToken = Boolean(process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN)
  return Boolean(accountId && (hasS3 || hasToken))
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
  if (s3) {
    try {
      const res = await s3.client.send(
        new GetObjectCommand({
          Bucket: s3.bucketName,
          Key: key,
        })
      )

      const raw = await res.Body?.transformToString()
      if (raw) {
        const parsed = JSON.parse(raw) as T
        memoryCache.set(key, { data: parsed, timestamp: now })
        return parsed
      }
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.Code === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return null
      }
      console.warn(`[CloudStore] S3 get error for "${key}", attempting REST fallback...`)
    }
  }

  // REST API fallback via Cloudflare token
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'
  if (accountId && bucketName) {
    try {
      let token = await refreshCloudflareToken()
      if (token) {
        const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`
        let res = await fetch(r2Url, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (res.status === 401 || res.status === 403) {
          token = await refreshCloudflareToken()
          res = await fetch(r2Url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
          })
        }
        if (res.status === 404) return null
        if (res.ok) {
          const parsed = (await res.json()) as T
          memoryCache.set(key, { data: parsed, timestamp: now })
          return parsed
        }
      }
    } catch (err) {
      console.error(`[CloudStore REST get error for "${key}"]:`, err)
    }
  }

  if (cached) return cached.data as T
  return null
}

/**
 * Persist JSON document atomically to cloud storage and update memory cache.
 */
export async function cloudPut<T>(key: CloudKey, data: T): Promise<boolean> {
  const now = Date.now()
  // Immediate write-through cache update
  memoryCache.set(key, { data, timestamp: now })

  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const s3 = getS3Client()
  if (s3) {
    try {
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
      console.warn(`[CloudStore] S3 put failed for "${key}", attempting REST fallback...`)
    }
  }

  // REST API fallback via Cloudflare token
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'
  if (accountId && bucketName) {
    try {
      let token = await refreshCloudflareToken()
      if (token) {
        const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`
        let res = await fetch(r2Url, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: jsonStr,
        })
        if (res.status === 401 || res.status === 403) {
          token = await refreshCloudflareToken()
          res = await fetch(r2Url, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: jsonStr,
          })
        }
        if (res.ok) return true
      }
    } catch (err) {
      console.error(`[CloudStore REST put error for "${key}"]:`, err)
    }
  }

  return false
}

/**
 * Delete key from cloud storage and remove from memory cache.
 */
export async function cloudDelete(key: CloudKey): Promise<boolean> {
  memoryCache.delete(key)
  const s3 = getS3Client()
  if (s3) {
    try {
      await s3.client.send(
        new DeleteObjectCommand({
          Bucket: s3.bucketName,
          Key: key,
        })
      )
      return true
    } catch (err) {
      console.warn(`[CloudStore] S3 delete failed for "${key}", attempting REST fallback...`)
    }
  }

  // REST API fallback via Cloudflare token
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'
  if (accountId && bucketName) {
    try {
      let token = await refreshCloudflareToken()
      if (token) {
        const r2Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`
        let res = await fetch(r2Url, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) return true
      }
    } catch (err) {
      console.error(`[CloudStore REST delete error for "${key}"]:`, err)
    }
  }

  return false
}
