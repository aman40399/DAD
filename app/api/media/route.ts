import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getAllArticles } from '@/lib/articles'
import { listR2Objects } from '@/lib/r2'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export interface MediaItem {
  id: string
  url: string
  title: string
  source: 'upload' | 'article'
  aspectRatio: string
  createdAt: string
  size?: number
}

export async function GET(req: NextRequest) {
  try {
    const mediaMap = new Map<string, MediaItem>()

    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev'

    // 1. Fetch Cloudflare R2 bucket objects via lib/r2 (S3 or REST API with auto-refresh)
    try {
      const objects = await listR2Objects()
      for (const obj of objects) {
        const key = obj.key
        if (key === 'test.txt' || key === 'test-upload-check.txt' || key.startsWith('.')) continue
        const isImage = /\.(webp|jpg|jpeg|png|gif|avif|svg)$/i.test(key)
        if (isImage) {
          const cdnUrl = `${publicUrl.replace(/\/$/, '')}/${key}`
          const rawName = key
            .replace(/^news\//, '')
            .replace(/^[0-9]+-/, '')
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]+/g, ' ')
          mediaMap.set(cdnUrl, {
            id: `r2-${key}`,
            url: cdnUrl,
            title: rawName.trim() || 'Uploaded Media Asset',
            source: 'upload',
            aspectRatio: '16:10',
            createdAt: obj.last_modified || new Date().toISOString(),
            size: obj.size,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching R2 bucket objects:', err)
    }

    // 2. Scan public/uploads directory (local filesystem fallback)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (fs.existsSync(uploadsDir)) {
      try {
        const files = fs.readdirSync(uploadsDir)
        for (const file of files) {
          if (file.startsWith('.')) continue
          const filePath = path.join(uploadsDir, file)
          try {
            const stats = fs.statSync(filePath)
            const isImage = /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file)
            if (stats.isFile() && stats.size > 500 && isImage) {
              const url = `/uploads/${file}`
              if (!mediaMap.has(url)) {
                mediaMap.set(url, {
                  id: `upload-${file}`,
                  url,
                  title: file.replace(/^[0-9]+-/, '').replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
                  source: 'upload',
                  aspectRatio: '16:10',
                  createdAt: stats.mtime.toISOString(),
                  size: stats.size,
                })
              }
            }
          } catch {
            // ignore stat errors
          }
        }
      } catch {
        // ignore readdir errors
      }
    }

    // 3. Scan articles for images
    try {
      const articles = await getAllArticles()
      for (const article of articles) {
        const imgUrl = article.image_url || article.imageUrl
        if (imgUrl && !mediaMap.has(imgUrl)) {
          mediaMap.set(imgUrl, {
            id: `article-${article.id}`,
            url: imgUrl,
            title: article.title || 'Untitled Broadside Asset',
            source: 'article',
            aspectRatio: (article as any).image_aspect_ratio || (article as any).imageAspectRatio || '16:10',
            createdAt: article.published_at || article.created_at || new Date().toISOString(),
          })
        }
      }
    } catch (e) {
      console.error('Error fetching articles for media library:', e)
    }

    const items = Array.from(mediaMap.values())
    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(
      {
        success: true,
        count: items.length,
        media: items,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error: any) {
    console.error('Media fetch error:', error)
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 })
  }
}
