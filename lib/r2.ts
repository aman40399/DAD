import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { refreshCloudflareToken } from './d1'

export interface UploadResult {
  url: string
  key: string
  size: number
  contentType: string
  storage: 'cloudflare-r2' | 'local'
}

export interface R2Object {
  key: string
  size: number
  last_modified: string
}

function getR2S3Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || ''
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || ''
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev'

  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
    return { client, bucketName, accountId, publicUrl }
  }
  return null
}

/**
 * List objects in R2 bucket (prefers native S3 protocol)
 */
export async function listR2Objects(): Promise<R2Object[]> {
  const s3 = getR2S3Client()
  if (s3) {
    try {
      const response = await s3.client.send(
        new ListObjectsV2Command({
          Bucket: s3.bucketName,
          MaxKeys: 500,
        })
      )
      return (response.Contents || []).map((obj) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        last_modified: obj.LastModified?.toISOString() || new Date().toISOString(),
      }))
    } catch (err) {
      console.error('[R2 S3 ListObjects error]:', err)
    }
  }

  // Fallback to Cloudflare REST API if S3 is not available
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'

  if (accountId && bucketName) {
    const listUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects`
    try {
      let token = await refreshCloudflareToken()
      let res = await fetch(listUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      })

      if (res.status === 401 || res.status === 403) {
        token = await refreshCloudflareToken()
        res = await fetch(listUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store',
        })
      }

      if (res.ok) {
        const data = await res.json()
        return (data.result || []).map((obj: any) => ({
          key: obj.key,
          size: obj.size || 0,
          last_modified: obj.last_modified || new Date().toISOString(),
        }))
      }
    } catch (err) {
      console.error('[R2 REST List error]:', err)
    }
  }

  return []
}

/**
 * Upload buffer to Cloudflare R2 (prefers native S3 protocol, fallback to REST or local)
 */
export async function uploadMedia(
  buffer: Buffer,
  filename: string,
  contentType: string = 'image/webp'
): Promise<UploadResult> {
  const extension = filename.split('.').pop() || 'webp'
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const cleanBase = filename
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .slice(0, 40)
  const key = `news/${timestamp}-${cleanBase}-${random}.${extension}`

  // 1. Direct high-speed S3 upload to Cloudflare R2
  const s3 = getR2S3Client()
  if (s3) {
    try {
      await s3.client.send(
        new PutObjectCommand({
          Bucket: s3.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      )

      const fileUrl = `${s3.publicUrl.replace(/\/$/, '')}/${key}`

      return {
        url: fileUrl,
        key,
        size: buffer.length,
        contentType,
        storage: 'cloudflare-r2',
      }
    } catch (err: any) {
      console.error('[R2 S3 Put error]:', err)
      if (process.env.VERCEL) {
        throw new Error(`R2 Upload failed: ${err.message || 'S3 protocol error'}`)
      }
    }
  }

  // 2. Cloudflare REST API fallback
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev'

  if (accountId && bucketName) {
    try {
      const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`
      let token = await refreshCloudflareToken()
      let res = await fetch(r2ApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': contentType,
        },
        body: new Uint8Array(buffer),
      })

      if (res.status === 401 || res.status === 403) {
        token = await refreshCloudflareToken()
        res = await fetch(r2ApiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': contentType,
          },
          body: new Uint8Array(buffer),
        })
      }

      if (res.ok) {
        const fileUrl = `${publicUrl.replace(/\/$/, '')}/${key}`
        return {
          url: fileUrl,
          key,
          size: buffer.length,
          contentType,
          storage: 'cloudflare-r2',
        }
      }
    } catch (err) {
      console.error('[R2 REST API upload error]:', err)
    }
  }

  // 3. Fallback for local development
  if (process.env.VERCEL) {
    throw new Error('Cloudflare R2 credentials missing or failed on production.')
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  const localPath = path.join(uploadsDir, `${timestamp}-${cleanBase}.${extension}`)
  fs.writeFileSync(localPath, buffer)

  return {
    url: `/uploads/${timestamp}-${cleanBase}.${extension}`,
    key,
    size: buffer.length,
    contentType,
    storage: 'local',
  }
}

/**
 * Permanently delete a media asset from Cloudflare R2 or local storage
 */
export async function deleteMedia(keyOrUrl: string): Promise<boolean> {
  if (!keyOrUrl) return false

  let key = keyOrUrl.trim()

  // If passed an id like "r2-news/..." or "upload-...", extract key
  if (key.startsWith('r2-')) {
    key = key.replace(/^r2-/, '')
  }

  // If passed a CDN URL or relative URL, extract the path key
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev'
  if (key.startsWith(publicUrl)) {
    key = key.slice(publicUrl.length).replace(/^\/+/, '')
  } else if (key.startsWith('http://') || key.startsWith('https://')) {
    try {
      const parsed = new URL(key)
      key = parsed.pathname.replace(/^\/+/, '')
    } catch {
      // ignore
    }
  }

  // 1. If it's a local upload
  if (key.startsWith('/uploads/') || key.startsWith('uploads/') || key.startsWith('upload-')) {
    const filename = key.replace(/^(upload-|\/uploads\/|uploads\/)/, '')
    const localPath = path.join(process.cwd(), 'public', 'uploads', filename)
    try {
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath)
        return true
      }
    } catch (err) {
      console.error('[deleteMedia local error]:', err)
    }
    return false
  }

  // 2. Cloudflare R2 via native S3 Client
  const s3 = getR2S3Client()
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
      console.error('[deleteMedia S3 error]:', err)
    }
  }

  // 3. Cloudflare REST API fallback
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'singhmonster-media'

  if (accountId && bucketName) {
    try {
      const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(key)}`
      let token = await refreshCloudflareToken()
      let res = await fetch(r2ApiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.status === 401 || res.status === 403) {
        token = await refreshCloudflareToken()
        res = await fetch(r2ApiUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }

      if (res.ok) {
        return true
      }
    } catch (err) {
      console.error('[deleteMedia REST error]:', err)
    }
  }

  // Also check if a local copy exists and clean it up
  const localName = key.replace(/^news\//, '')
  const fallbackLocalPath = path.join(process.cwd(), 'public', 'uploads', localName)
  if (fs.existsSync(fallbackLocalPath)) {
    try {
      fs.unlinkSync(fallbackLocalPath)
      return true
    } catch {}
  }

  return true
}
