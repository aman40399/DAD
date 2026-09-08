import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

// Cloudflare R2 configuration
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || ''
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '' // e.g. https://media.yourdomain.com or R2 dev URL

const hasR2Config = Boolean(accountId && accessKeyId && secretAccessKey && bucketName)

const s3Client = hasR2Config
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null

export interface UploadResult {
  url: string
  key: string
  size: number
  contentType: string
  storage: 'cloudflare-r2' | 'local'
}

/**
 * Upload buffer or base64 to Cloudflare R2 (or local fallback in dev)
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

  // 1. If Cloudflare R2 credentials exist, upload directly to R2
  if (s3Client && hasR2Config) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    )

    const fileUrl = publicUrl ? `${publicUrl.replace(/\/$/, '')}/${key}` : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`

    return {
      url: fileUrl,
      key,
      size: buffer.length,
      contentType,
      storage: 'cloudflare-r2',
    }
  }

  // 2. If Cloudflare API Token and Account ID exist, upload directly via Cloudflare R2 REST API
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (apiToken && accountId && bucketName) {
    try {
      const r2ApiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`
      const res = await fetch(r2ApiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': contentType,
        },
        body: new Uint8Array(buffer),
      })

      if (res.ok) {
        const fileUrl = publicUrl
          ? `${publicUrl.replace(/\/$/, '')}/${key}`
          : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`

        return {
          url: fileUrl,
          key,
          size: buffer.length,
          contentType,
          storage: 'cloudflare-r2',
        }
      }
    } catch (err) {
      console.error('R2 REST API upload error:', err)
    }
  }

  // 2. Fallback for local development if R2 credentials aren't in .env yet
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
