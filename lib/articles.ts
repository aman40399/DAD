import { Article, ArticleStatus, CreateArticleInput, ListArticlesOptions, PaginatedArticles, UpdateArticleInput } from '@/types'
import { generateSlug, resolveSlugCollisionFromList } from './utils'
import { isD1Configured, queryD1, executeD1 } from './d1'
import { cloudGet, cloudPut, CLOUD_KEYS, isCloudConfigured, invalidateCloudCache } from './backend/cloudStore'
import { SEED_ARTICLES } from './seedData'

export { isD1Configured, isCloudConfigured }
export const isR2Configured = isCloudConfigured

// Transform raw database row / object to standard Article type with dual compatibility
export function transformArticle(data: any): Article {
  const id = String(data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'art-' + Date.now()))
  const rawTitle = data.title || ''
  const title = rawTitle.replace(/^[\u200B\u200C\u200D\uFEFF\s]+/, '').replace(/[\u200B\u200C\u200D\uFEFF\s]+$/, '')
  const slug = data.slug || ''
  const subtitle = data.subtitle || undefined
  const excerpt = data.excerpt || ''
  const content = data.content || ''
  const author = data.author || 'Dhananjay Singh'
  const category = data.category || 'News'

  const image_url = data.image_url || data.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
  const image_caption = data.image_caption || data.imageCaption || undefined
  const video_url = data.video_url !== undefined ? data.video_url : (data.videoUrl !== undefined ? data.videoUrl : null)
  const featured = Boolean(data.featured)
  const is_breaking = Boolean(data.is_breaking !== undefined ? data.is_breaking : data.isBreaking)
  const status: ArticleStatus = (data.status as ArticleStatus) || 'published'
  const homepage_position = data.homepage_position !== undefined && data.homepage_position !== null
    ? Number(data.homepage_position)
    : (data.homepagePosition !== undefined && data.homepagePosition !== null ? Number(data.homepagePosition) : null)

  let tags: string[] = []
  if (Array.isArray(data.tags)) {
    tags = data.tags
  } else if (typeof data.tags === 'string') {
    try { tags = JSON.parse(data.tags) } catch { tags = [] }
  }

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
    // Backward-compatibility aliases
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

// In-Memory Fast Cache
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const CACHE_TTL_MS = 30000 // 30 seconds

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}

export function invalidateArticleCache(): void {
  memoryCache.clear()
  invalidateCloudCache(CLOUD_KEYS.ARTICLES)
}

// Check if a slug is already taken (excluding optional article ID for updates)
export async function isSlugTaken(slug: string, excludeArticleId?: string): Promise<boolean> {
  const articles = await getAllArticles()
  return articles.some(a => a.slug === slug && (!excludeArticleId || a.id !== excludeArticleId))
}

// Generate unique slug with automatic collision resolution
export async function generateUniqueArticleSlug(title: string, excludeArticleId?: string): Promise<string> {
  const articles = await getAllArticles()
  const baseSlug = generateSlug(title)
  const existingSlugs = articles.filter(a => !excludeArticleId || a.id !== excludeArticleId).map(a => a.slug)
  return resolveSlugCollisionFromList(baseSlug, existingSlugs)
}

// Get all articles (sorted by published_at desc) - Authoritative Cloud Database
export async function getAllArticles(): Promise<Article[]> {
  const cacheKey = 'all_articles'
  const cached = getCached<Article[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  let articles: Article[] | null = null

  // 1. Fetch from Permanent Cloud Store (R2)
  try {
    const raw = await cloudGet<any[]>(CLOUD_KEYS.ARTICLES)
    if (Array.isArray(raw) && raw.length > 0) {
      articles = raw.map(transformArticle)
    }
  } catch (err) {
    console.error('⚠️ [CloudStore] Error reading articles:', err)
  }

  // 2. If D1 is configured and has records
  if (!articles && isD1Configured()) {
    try {
      const rows = await queryD1('SELECT * FROM articles ORDER BY published_at DESC')
      if (rows && rows.length > 0) {
        articles = rows.map(transformArticle)
        await cloudPut(CLOUD_KEYS.ARTICLES, articles)
      }
    } catch {}
  }

  // 3. If cloud is completely empty, initialize from seed data in memory
  if (!articles || articles.length === 0) {
    const seeded = (SEED_ARTICLES || []).map(transformArticle)
    articles = seeded
    if (seeded.length > 0) {
      await cloudPut(CLOUD_KEYS.ARTICLES, seeded)
    }
  }

  // Sort descending by published_at
  articles.sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())

  setCached(cacheKey, articles)
  return articles
}

// Get article by ID
export async function getArticleById(id: string): Promise<Article | null> {
  const cleanId = (id || '').trim()
  if (!cleanId) return null

  const cacheKey = `article_id_${cleanId}`
  const cached = getCached<Article | null>(cacheKey)
  if (cached) return cached

  const articles = await getAllArticles()
  const found = articles.find(a => a.id === cleanId || a.slug.toLowerCase() === cleanId.toLowerCase()) || null

  if (found) {
    setCached(cacheKey, found)
  }
  return found
}

// Get article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const cleanSlug = (slug || '').trim()
  if (!cleanSlug) return null

  const cacheKey = `article_slug_${cleanSlug.toLowerCase()}`
  const cached = getCached<Article | null>(cacheKey)
  if (cached) return cached

  const articles = await getAllArticles()
  const found = articles.find(
    a => a.slug.toLowerCase() === cleanSlug.toLowerCase() || a.id === cleanSlug
  ) || null

  if (found) {
    setCached(cacheKey, found)
  }
  return found
}

// Get articles by category
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const catClean = (category || '').trim().toLowerCase()
  if (!catClean) return []

  const cacheKey = `category_${catClean}`
  const cached = getCached<Article[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  const all = await getAllArticles()
  const filtered = all
    .filter(a => a.category?.toLowerCase() === catClean && a.status === 'published')
    .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())

  setCached(cacheKey, filtered)
  return filtered
}

// Get featured articles
export async function getFeaturedArticles(): Promise<Article[]> {
  const all = await getAllArticles()
  return all
    .filter(a => Boolean(a.featured) && a.status === 'published')
    .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
}

// Get recent articles
export async function getRecentArticles(limit: number = 10): Promise<Article[]> {
  const cacheKey = `recent_articles_${limit}`
  const cached = getCached<Article[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  const all = await getAllArticles()
  const recent = all
    .filter(a => a.status === 'published')
    .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
    .slice(0, limit)

  setCached(cacheKey, recent)
  return recent
}

// Get homepage articles (positions 1-15)
export async function getHomepageArticles(): Promise<Article[]> {
  const cacheKey = 'homepage_articles'
  const cached = getCached<Article[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  const all = await getAllArticles()
  const pinned = all
    .filter(a => a.status === 'published' && typeof a.homepage_position === 'number' && a.homepage_position >= 1 && a.homepage_position <= 15)
    .sort((a, b) => (a.homepage_position || 99) - (b.homepage_position || 99))

  setCached(cacheKey, pinned)
  return pinned
}

// Get articles by specific broadsheet positions
export async function getArticlesByPosition(positions: number[]): Promise<Article[]> {
  const all = await getAllArticles()
  return all
    .filter(a => a.status === 'published' && typeof a.homepage_position === 'number' && positions.includes(a.homepage_position))
    .sort((a, b) => (a.homepage_position || 99) - (b.homepage_position || 99))
}

// Get breaking news stories
export async function getBreakingArticles(): Promise<Article[]> {
  const all = await getAllArticles()
  return all
    .filter(a => a.status === 'published' && (a.is_breaking || a.homepage_position === 1))
    .sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
}

// List articles with filtering, search, and pagination
export async function listArticles(options?: ListArticlesOptions): Promise<PaginatedArticles> {
  const all = await getAllArticles()
  let list = [...all]

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
}

// Commit updated articles list permanently to Cloud Store
async function commitArticlesToCloud(articles: Article[]): Promise<boolean> {
  return await cloudPut(CLOUD_KEYS.ARTICLES, articles)
}

// Create new article
export async function createArticle(input: CreateArticleInput): Promise<Article | null> {
  invalidateArticleCache()
  const articles = await getAllArticles()
  const now = new Date().toISOString()

  const id = input.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'art-' + Date.now())
  const baseSlug = input.slug ? generateSlug(input.slug) : generateSlug(input.title)
  const existingSlugs = articles.map(a => a.slug)
  const finalSlug = resolveSlugCollisionFromList(baseSlug, existingSlugs)

  const newPosition = typeof input.homepage_position === 'number' ? input.homepage_position : null

  // If assigned a homepage position, unpin any other article with that position
  if (newPosition) {
    for (const a of articles) {
      if (a.homepage_position === newPosition) {
        a.homepage_position = null
        a.homepagePosition = null
      }
    }
  }

  const rawArticle: Article = transformArticle({
    ...input,
    id,
    slug: finalSlug,
    homepage_position: newPosition,
    status: input.status || 'draft',
    created_at: input.created_at || now,
    updated_at: input.updated_at || now,
    published_at: input.published_at || (input.status === 'published' ? now : ''),
  })

  articles.unshift(rawArticle)
  await commitArticlesToCloud(articles)

  // Mirror to D1 if configured
  if (isD1Configured()) {
    try {
      await executeD1(
        `INSERT INTO articles (
          id, title, slug, subtitle, excerpt, content, author, category,
          image_url, image_caption, video_url, featured, is_breaking, status,
          homepage_position, tags, language, created_at, updated_at, published_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)`,
        [
          rawArticle.id,
          rawArticle.title,
          rawArticle.slug,
          rawArticle.subtitle || null,
          rawArticle.excerpt,
          rawArticle.content,
          rawArticle.author,
          rawArticle.category,
          rawArticle.image_url,
          rawArticle.image_caption || null,
          rawArticle.video_url,
          rawArticle.featured ? 1 : 0,
          rawArticle.is_breaking ? 1 : 0,
          rawArticle.status,
          rawArticle.homepage_position,
          JSON.stringify(rawArticle.tags || []),
          rawArticle.language || 'english',
          now,
          now,
          rawArticle.published_at || null,
        ]
      )
    } catch {}
  }

  return rawArticle
}

// Update existing article
export async function updateArticle(id: string, updates: UpdateArticleInput): Promise<Article | null> {
  invalidateArticleCache()
  const articles = await getAllArticles()
  const index = articles.findIndex(a => a.id === id)
  if (index === -1) return null

  const existing = articles[index]
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
    for (const a of articles) {
      if (a.id !== id && a.homepage_position === newHomepagePosition) {
        a.homepage_position = null
        a.homepagePosition = null
      }
    }
  }

  let finalSlug = existing.slug
  if (updates.slug !== undefined && updates.slug !== existing.slug) {
    const baseSlug = generateSlug(updates.slug)
    const existingSlugs = articles.filter(a => a.id !== id).map(a => a.slug)
    finalSlug = resolveSlugCollisionFromList(baseSlug, existingSlugs)
  }

  const merged = transformArticle({
    ...existing,
    ...updates,
    id: existing.id,
    slug: finalSlug,
    status: newStatus,
    homepage_position: newHomepagePosition,
    published_at: newPublishedAt,
    updated_at: now,
  })

  articles[index] = merged
  await commitArticlesToCloud(articles)

  // Mirror to D1 if configured
  if (isD1Configured()) {
    try {
      await executeD1(
        `UPDATE articles SET
          title = ?1, slug = ?2, subtitle = ?3, excerpt = ?4, content = ?5,
          author = ?6, category = ?7, image_url = ?8, image_caption = ?9,
          video_url = ?10, featured = ?11, is_breaking = ?12, status = ?13,
          homepage_position = ?14, tags = ?15, language = ?16, updated_at = ?17, published_at = ?18
        WHERE id = ?19`,
        [
          merged.title,
          merged.slug,
          merged.subtitle || null,
          merged.excerpt,
          merged.content,
          merged.author,
          merged.category,
          merged.image_url,
          merged.image_caption || null,
          merged.video_url,
          merged.featured ? 1 : 0,
          merged.is_breaking ? 1 : 0,
          merged.status,
          merged.homepage_position,
          JSON.stringify(merged.tags || []),
          merged.language || 'english',
          merged.updated_at,
          merged.published_at || null,
          id,
        ]
      )
    } catch {}
  }

  return merged
}

// Delete article
export async function deleteArticle(id: string): Promise<boolean> {
  invalidateArticleCache()
  const articles = await getAllArticles()
  const initialLen = articles.length
  const filtered = articles.filter(a => a.id !== id)
  if (filtered.length !== initialLen) {
    await commitArticlesToCloud(filtered)

    if (isD1Configured()) {
      try {
        await executeD1('DELETE FROM articles WHERE id = ?1', [id])
      } catch {}
    }
    return true
  }
  return false
}

// Set article status (draft / published / archived)
export async function setArticleStatus(id: string, status: ArticleStatus): Promise<Article | null> {
  return updateArticle(id, { status })
}

// Update homepage position (1-15, or null to unpin)
export async function updateArticlePosition(id: string, position: number | null): Promise<boolean> {
  invalidateArticleCache()
  const articles = await getAllArticles()
  const article = articles.find(a => a.id === id)
  if (!article) return false

  if (position !== null && position >= 1 && position <= 15) {
    for (const a of articles) {
      if (a.id !== id && a.homepage_position === position) {
        a.homepage_position = null
        a.homepagePosition = null
      }
    }
  }

  article.homepage_position = position
  article.homepagePosition = position
  article.updated_at = new Date().toISOString()
  await commitArticlesToCloud(articles)

  if (isD1Configured()) {
    try {
      if (position !== null && position >= 1 && position <= 15) {
        await executeD1('UPDATE articles SET homepage_position = NULL WHERE homepage_position = ?1', [position])
      }
      await executeD1('UPDATE articles SET homepage_position = ?1 WHERE id = ?2', [position, id])
    } catch {}
  }

  return true
}

// Swap positions between two articles
export async function swapArticlePositions(id1: string, id2: string): Promise<boolean> {
  invalidateArticleCache()
  const articles = await getAllArticles()
  const a1 = articles.find(a => a.id === id1)
  const a2 = articles.find(a => a.id === id2)
  if (!a1 || !a2) return false

  const pos1 = a1.homepage_position
  const pos2 = a2.homepage_position

  a1.homepage_position = pos2
  a1.homepagePosition = pos2
  a2.homepage_position = pos1
  a2.homepagePosition = pos1
  a1.updated_at = new Date().toISOString()
  a2.updated_at = new Date().toISOString()

  await commitArticlesToCloud(articles)

  if (isD1Configured()) {
    try {
      await executeD1('UPDATE articles SET homepage_position = NULL WHERE id = ?1', [id1])
      await executeD1('UPDATE articles SET homepage_position = ?1 WHERE id = ?2', [pos1, id2])
      await executeD1('UPDATE articles SET homepage_position = ?2 WHERE id = ?1', [id1, pos2])
    } catch {}
  }

  return true
}

// Get currently unassigned broadsheet positions (1-15)
export async function getAvailablePositions(): Promise<number[]> {
  const articles = await getAllArticles()
  const usedPositions = articles
    .filter(a => a.status === 'published' && typeof a.homepage_position === 'number' && a.homepage_position >= 1 && a.homepage_position <= 15)
    .map(a => a.homepage_position as number)

  return Array.from({ length: 15 }, (_, i) => i + 1).filter((p) => !usedPositions.includes(p))
}

// Verify admin credentials
export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const fallbackUsername = process.env.ADMIN_USERNAME || 'admin'
  const fallbackPassword = process.env.ADMIN_PASSWORD || 'pass@123'
  return username === fallbackUsername && password === fallbackPassword
}
