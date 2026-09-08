import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getAllArticles } from '@/lib/articles'

export const dynamic = 'force-dynamic'

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

    // 1. Scan public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      for (const file of files) {
        if (file.startsWith('.')) continue
        const filePath = path.join(uploadsDir, file)
        try {
          const stats = fs.statSync(filePath)
          const isImage = /\.(webp|jpg|jpeg|png|gif|avif)$/i.test(file)
          if (stats.isFile() && stats.size > 500 && isImage) {
            const url = `/uploads/${file}`
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
        } catch (e) {
          // ignore stat errors
        }
      }
    }

    // 2. Scan articles for images
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

    return NextResponse.json({
      success: true,
      count: items.length,
      media: items,
    })
  } catch (error: any) {
    console.error('Media fetch error:', error)
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 })
  }
}
