import { Article, ArticleStatus, CreateArticleInput, ListArticlesOptions, PaginatedArticles, UpdateArticleInput } from '@/types'
import { SEED_ARTICLES } from './seedData'
import { generateSlug, resolveSlugCollisionFromList } from './utils'

declare global {
  // Global declaration to preserve memory store across Next.js HMR reloads
  var __meridian_articles_store__: Article[] | undefined
}

let fs: any = null
let path: any = null
if (typeof window === 'undefined') {
  try {
    fs = require('fs')
    path = require('path')
  } catch (e) {
    // In edge or browser runtime, fs/path might not be available
  }
}

function getDataFilePath(): string | null {
  if (!fs || !path) return null
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    return path.join(dataDir, 'articles.json')
  } catch (e) {
    return null
  }
}

function normalizeArticle(data: any): Article {
  const id = String(data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'art-' + Date.now()))
  const title = data.title || ''
  const slug = data.slug || ''
  const subtitle = data.subtitle || undefined
  const excerpt = data.excerpt || ''
  const content = data.content || ''
  const author = 'Dhananjay Singh'
  const category = data.category || 'News'

  const image_url = data.image_url || data.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
  const image_caption = data.image_caption || data.imageCaption || undefined
  const video_url = data.video_url !== undefined ? data.video_url : (data.videoUrl !== undefined ? data.videoUrl : null)
  const featured = Boolean(data.featured)
  const is_breaking = Boolean(data.is_breaking !== undefined ? data.is_breaking : data.isBreaking)
  const status: ArticleStatus = (data.status as ArticleStatus) || 'published'
  const homepage_position = data.homepage_position !== undefined 
    ? data.homepage_position 
    : (data.homepagePosition !== undefined ? data.homepagePosition : null)
  const tags = Array.isArray(data.tags) ? data.tags : []
  const language = data.language || 'english'
  const created_at = data.created_at || data.createdAt || new Date().toISOString()
  const updated_at = data.updated_at || data.updatedAt || new Date().toISOString()
  const rawPub = data.published_at !== undefined ? data.published_at : data.publishedAt
  const published_at = (rawPub !== undefined && rawPub !== null && rawPub !== '')
    ? String(rawPub)
    : (status === 'published' ? created_at : '')

  return {
    id,
    title,
    slug,
    subtitle,
    excerpt,
    content,
    author,
    category,
    image_url,
    image_caption,
    video_url,
    featured,
    is_breaking,
    status,
    homepage_position,
    tags,
    language,
    created_at,
    updated_at,
    published_at,
    // Aliases for compatibility
    imageUrl: image_url,
    imageCaption: image_caption,
    videoUrl: video_url,
    isBreaking: is_breaking,
    homepagePosition: homepage_position,
    createdAt: created_at,
    updatedAt: updated_at,
    publishedAt: published_at,
  }
}

function loadFromDisk(): Article[] {
  const filePath = getDataFilePath()
  if (filePath && fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeArticle)
      }
    } catch (e) {
      console.warn('⚠️ Could not parse local articles.json, initializing from SEED_ARTICLES:', e)
    }
  }

  // Fallback to seed articles
  const initial = SEED_ARTICLES.map(normalizeArticle)
  saveToDisk(initial)
  return initial
}

function saveToDisk(articles: Article[]): void {
  const filePath = getDataFilePath()
  if (!filePath) return
  try {
    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf-8')
    if (fs.existsSync(filePath)) {
      globalThis.__meridian_articles_mtime__ = fs.statSync(filePath).mtimeMs
    }
  } catch (e) {
    // Non-fatal if filesystem is read-only (e.g. serverless)
  }
}

declare global {
  var __meridian_articles_store__: Article[] | undefined
  var __meridian_articles_mtime__: number | undefined
}

function getStore(): Article[] {
  const filePath = getDataFilePath()
  let currentMtime = 0
  if (filePath && fs && fs.existsSync(filePath)) {
    try {
      currentMtime = fs.statSync(filePath).mtimeMs
    } catch {}
  }

  if (
    !globalThis.__meridian_articles_store__ ||
    (currentMtime > 0 && currentMtime !== globalThis.__meridian_articles_mtime__)
  ) {
    globalThis.__meridian_articles_store__ = loadFromDisk()
    globalThis.__meridian_articles_mtime__ = currentMtime
  }
  return globalThis.__meridian_articles_store__
}

function setStore(articles: Article[]): void {
  globalThis.__meridian_articles_store__ = articles
  saveToDisk(articles)
}


export const localStore = {
  getAll(): Article[] {
    return [...getStore()]
  },

  getById(id: string): Article | null {
    const item = getStore().find((a) => a.id === id)
    return item ? { ...item } : null
  },

  getBySlug(slug: string): Article | null {
    const item = getStore().find((a) => a.slug === slug)
    return item ? { ...item } : null
  },

  getByCategory(category: string): Article[] {
    return getStore()
      .filter((a) => a.category.toLowerCase() === category.toLowerCase() && a.status === 'published')
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  },

  getFeatured(): Article[] {
    return getStore()
      .filter((a) => a.featured && a.status === 'published')
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  },

  getRecent(limit: number = 10): Article[] {
    return getStore()
      .filter((a) => a.status === 'published')
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, limit)
  },

  getHomepage(): Article[] {
    return getStore()
      .filter((a) => a.status === 'published' && typeof a.homepage_position === 'number' && a.homepage_position >= 1 && a.homepage_position <= 15)
      .sort((a, b) => (a.homepage_position || 99) - (b.homepage_position || 99))
  },

  getByPositions(positions: number[]): Article[] {
    return getStore()
      .filter((a) => a.status === 'published' && typeof a.homepage_position === 'number' && positions.includes(a.homepage_position))
      .sort((a, b) => (a.homepage_position || 99) - (b.homepage_position || 99))
  },

  getBreaking(): Article[] {
    return getStore()
      .filter((a) => a.status === 'published' && (a.is_breaking || a.homepage_position === 1))
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  },

  getAvailablePositions(): number[] {
    const used = getStore()
      .filter((a) => a.status === 'published' && typeof a.homepage_position === 'number' && a.homepage_position >= 1 && a.homepage_position <= 15)
      .map((a) => a.homepage_position as number)
    return Array.from({ length: 15 }, (_, i) => i + 1).filter((pos) => !used.includes(pos))
  },

  list(options?: ListArticlesOptions): PaginatedArticles {
    let list = [...getStore()]

    if (options?.status && options.status !== 'all') {
      list = list.filter((a) => a.status === options.status)
    }

    if (options?.category) {
      list = list.filter((a) => a.category.toLowerCase() === options.category!.toLowerCase())
    }

    if (options?.search) {
      const q = options.search.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    const orderBy = options?.orderBy || 'published_at'
    const orderDirection = options?.orderDirection || 'desc'
    list.sort((a: any, b: any) => {
      let valA = a[orderBy]
      let valB = b[orderBy]
      if (orderBy === 'published_at' || orderBy === 'created_at') {
        const timeA = new Date(valA || 0).getTime()
        const timeB = new Date(valB || 0).getTime()
        return orderDirection === 'asc' ? timeA - timeB : timeB - timeA
      }
      if (valA < valB) return orderDirection === 'asc' ? -1 : 1
      if (valA > valB) return orderDirection === 'asc' ? 1 : -1
      return 0
    })

    const total = list.length
    const page = Math.max(1, options?.page || 1)
    const limit = Math.max(1, options?.limit || 20)
    const offset = options?.offset !== undefined ? options.offset : (page - 1) * limit
    const paginated = list.slice(offset, offset + limit)

    return {
      articles: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    }
  },

  create(input: CreateArticleInput): Article {
    const store = getStore()
    const now = new Date().toISOString()
    const rawArticle: any = {
      ...input,
      id: input.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'art-' + Date.now()),
      status: input.status || 'draft',
      created_at: input.created_at || now,
      updated_at: input.updated_at || now,
      published_at: input.published_at || (input.status === 'published' ? now : ''),
    }

    // Handle transliteration and collision in slug using lib/utils
    const baseSlug = input.slug ? generateSlug(input.slug) : generateSlug(input.title)
    const existingSlugs = store.map((a) => a.slug)
    rawArticle.slug = resolveSlugCollisionFromList(baseSlug, existingSlugs)

    // If assigned a homepage position, unpin any other article with that position
    if (rawArticle.homepage_position) {
      for (const a of store) {
        if (a.homepage_position === rawArticle.homepage_position) {
          a.homepage_position = null
          a.homepagePosition = null
        }
      }
    }

    const created = normalizeArticle(rawArticle)
    store.unshift(created)
    setStore(store)
    return created
  },

  update(id: string, updates: UpdateArticleInput): Article | null {
    const store = getStore()
    const index = store.findIndex((a) => a.id === id)
    if (index === -1) return null

    const existing = store[index]
    const now = new Date().toISOString()

    const newStatus = updates.status !== undefined ? updates.status : existing.status
    let newPublishedAt = updates.published_at || updates.publishedAt || existing.published_at
    if (newStatus === 'published' && existing.status !== 'published' && !updates.published_at && !updates.publishedAt) {
      newPublishedAt = now
    }

    const newHomepagePosition = updates.homepage_position !== undefined
      ? updates.homepage_position
      : (updates.homepagePosition !== undefined ? updates.homepagePosition : existing.homepage_position)

    // If new position specified and not null, unpin any conflicting article
    if (newHomepagePosition !== null && newHomepagePosition !== undefined) {
      for (const a of store) {
        if (a.id !== id && a.homepage_position === newHomepagePosition) {
          a.homepage_position = null
          a.homepagePosition = null
        }
      }
    }

    let finalSlug = existing.slug
    if (updates.slug !== undefined) {
      const baseSlug = generateSlug(updates.slug)
      const existingSlugs = store.filter((a) => a.id !== id).map((a) => a.slug)
      finalSlug = resolveSlugCollisionFromList(baseSlug, existingSlugs)
    }

    const merged = normalizeArticle({
      ...existing,
      ...updates,
      id: existing.id,
      slug: finalSlug,
      status: newStatus,
      homepage_position: newHomepagePosition,
      published_at: newPublishedAt,
      updated_at: now,
    })

    store[index] = merged
    setStore(store)
    return merged
  },

  delete(id: string): boolean {
    const store = getStore()
    const initialLen = store.length
    const filtered = store.filter((a) => a.id !== id)
    if (filtered.length !== initialLen) {
      setStore(filtered)
      return true
    }
    return false
  },

  setStatus(id: string, status: ArticleStatus): Article | null {
    return this.update(id, { status })
  },

  updatePosition(id: string, position: number | null): boolean {
    const updated = this.update(id, { homepage_position: position })
    return !!updated
  },

  swapPositions(id1: string, id2: string): boolean {
    const store = getStore()
    const a1 = store.find((a) => a.id === id1)
    const a2 = store.find((a) => a.id === id2)
    if (!a1 || !a2) return false

    const pos1 = a1.homepage_position
    const pos2 = a2.homepage_position

    a1.homepage_position = pos2
    a1.homepagePosition = pos2
    a2.homepage_position = pos1
    a2.homepagePosition = pos1
    a1.updated_at = new Date().toISOString()
    a2.updated_at = new Date().toISOString()

    setStore(store)
    return true
  },

  reset(): void {
    const initial = SEED_ARTICLES.map(normalizeArticle)
    setStore(initial)
  },
}
