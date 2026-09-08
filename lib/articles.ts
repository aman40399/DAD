import { Article, ArticleStatus, CreateArticleInput, ListArticlesOptions, PaginatedArticles, UpdateArticleInput } from '@/types'
import { localStore } from './localStore'
import { generateSlug, resolveSlugCollision } from './utils'
import { isD1Configured, queryD1, executeD1 } from './d1'

export { isD1Configured }

// Transform raw database row / object to standard Article type with dual compatibility
export function transformArticle(data: any): Article {
  const id = String(data.id)
  const title = data.title || ''
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
    : null
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

// Check if a slug is already taken (excluding optional article ID for updates)
export async function isSlugTaken(slug: string, excludeArticleId?: string): Promise<boolean> {
  if (isD1Configured()) {
    try {
      const rows = excludeArticleId
        ? await queryD1('SELECT id FROM articles WHERE slug = ?1 AND id != ?2 LIMIT 1', [slug, excludeArticleId])
        : await queryD1('SELECT id FROM articles WHERE slug = ?1 LIMIT 1', [slug])
      return rows.length > 0
    } catch {}
  }

  const store = localStore.getAll()
  return store.some(a => a.slug === slug && (!excludeArticleId || a.id !== excludeArticleId))
}

// Generate unique slug with automatic collision resolution
export async function generateUniqueArticleSlug(title: string, excludeArticleId?: string): Promise<string> {
  const baseSlug = generateSlug(title)
  return resolveSlugCollision(baseSlug, (candidate) => isSlugTaken(candidate, excludeArticleId))
}

// High-speed In-Memory Cache with TTL for instant page transitions and server rendering
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<any>>()
const CACHE_TTL_MS = 30000 // 30 seconds TTL

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
}

// Get all articles (sorted by published_at desc) - Cached
export async function getAllArticles(): Promise<Article[]> {
  const cacheKey = 'all_articles'
  const cached = getCached<Article[]>(cacheKey)
  if (cached) return cached

  let result: Article[]
  if (isD1Configured()) {
    try {
      const rows = await queryD1('SELECT * FROM articles ORDER BY published_at DESC')
      result = rows.map(transformArticle)
    } catch (error) {
      console.warn('⚠️ Cloudflare D1 error fetching all articles, falling back to local store:', error)
      result = localStore.getAll()
    }
  } else {
    result = localStore.getAll()
  }

  setCached(cacheKey, result)
  return result
}

// Get article by ID - Cached with multi-tier lookup
export async function getArticleById(id: string): Promise<Article | null> {
  const cleanId = (id || '').trim()
  if (!cleanId) return null

  const cacheKey = `article_id_${cleanId}`
  const cached = getCached<Article | null>(cacheKey)
  if (cached) return cached

  // 1. Quick check in all_articles cache
  const allCached = getCached<Article[]>('all_articles')
  if (allCached) {
    const found = allCached.find(a => a.id === cleanId || a.slug.toLowerCase() === cleanId.toLowerCase())
    if (found) {
      setCached(cacheKey, found)
      return found
    }
  }

  let result: Article | null = null
  if (isD1Configured()) {
    try {
      const rows = await queryD1('SELECT * FROM articles WHERE id = ? OR LOWER(slug) = ? LIMIT 1', [cleanId, cleanId.toLowerCase()])
      result = rows[0] ? transformArticle(rows[0]) : null
    } catch (error) {
      console.warn(`⚠️ Cloudflare D1 error fetching article id=${cleanId}:`, error)
    }
  }

  // 2. Fallback to fresh getAllArticles() if single query returned null
  if (!result) {
    try {
      const all = await getAllArticles()
      const found = all.find(a => a.id === cleanId || a.slug.toLowerCase() === cleanId.toLowerCase())
      if (found) result = found
    } catch {}
  }

  // 3. Fallback to local store
  if (!result) {
    result = localStore.getById(cleanId) || localStore.getBySlug(cleanId)
  }

  if (result) {
    setCached(cacheKey, result)
  }
  return result
}

// Get article by slug - Cached with multi-tier lookup
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const cleanSlug = (slug || '').trim()
  if (!cleanSlug) return null

  const cacheKey = `article_slug_${cleanSlug.toLowerCase()}`
  const cached = getCached<Article | null>(cacheKey)
  if (cached) return cached

  // 1. Quick check in all_articles cache
  const allCached = getCached<Article[]>('all_articles')
  if (allCached) {
    const found = allCached.find(a => a.slug.toLowerCase() === cleanSlug.toLowerCase() || a.id === cleanSlug)
    if (found) {
      setCached(cacheKey, found)
      return found
    }
  }

  let result: Article | null = null
  if (isD1Configured()) {
    try {
      const rows = await queryD1('SELECT * FROM articles WHERE LOWER(slug) = ? OR id = ? LIMIT 1', [cleanSlug.toLowerCase(), cleanSlug])
      result = rows[0] ? transformArticle(rows[0]) : null
    } catch (error) {
      console.warn(`⚠️ Cloudflare D1 error fetching article slug=${cleanSlug}:`, error)
    }
  }

  // 2. Fallback to fresh getAllArticles() if single query returned null
  if (!result) {
    try {
      const all = await getAllArticles()
      const found = all.find(a => a.slug.toLowerCase() === cleanSlug.toLowerCase() || a.id === cleanSlug)
      if (found) result = found
    } catch {}
  }

  // 3. Fallback to local store
  if (!result) {
    result = localStore.getBySlug(cleanSlug) || localStore.getById(cleanSlug)
  }

  if (result) {
    setCached(cacheKey, result)
  }
  return result
}

// Get articles by category - Cached with case-insensitivity
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const catClean = (category || '').trim().toLowerCase()
  if (!catClean) return []

  const cacheKey = `category_${catClean}`
  const cached = getCached<Article[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  let result: Article[] = []
  if (isD1Configured()) {
    try {
      const rows = await queryD1(
        "SELECT * FROM articles WHERE LOWER(category) = ? AND status = 'published' ORDER BY published_at DESC",
        [catClean]
      )
      result = rows.map(transformArticle)
    } catch (error) {
      console.warn(`⚠️ Cloudflare D1 error fetching category=${category}:`, error)
    }
  }

  // Fallback to getAllArticles() filtering if query returned empty
  if (result.length === 0) {
    try {
      const all = await getAllArticles()
      const filtered = all.filter(a => a.category?.toLowerCase() === catClean && a.status === 'published')
      if (filtered.length > 0) result = filtered
    } catch {}
  }

  if (result.length === 0) {
    result = localStore.getByCategory(category)
    if (result.length === 0 && catClean !== category) {
      result = localStore.getByCategory(catClean)
    }
  }

  setCached(cacheKey, result)
  return result
}

// Get featured articles
export async function getFeaturedArticles(): Promise<Article[]> {
  if (isD1Configured()) {
    try {
      const rows = await queryD1(
        "SELECT * FROM articles WHERE (featured = 1 OR featured = true) AND status = 'published' ORDER BY published_at DESC"
      )
      if (rows.length > 0) return rows.map(transformArticle)
    } catch (error) {
      console.warn('⚠️ Cloudflare D1 error fetching featured articles:', error)
    }
  }

  try {
    const all = await getAllArticles()
    const feat = all.filter(a => Boolean(a.featured) && a.status === 'published')
    if (feat.length > 0) return feat
  } catch {}

  return localStore.getFeatured()
}

// Get recent articles - Cached
export async function getRecentArticles(limit: number = 10): Promise<Article[]> {
  const cacheKey = `recent_articles_${limit}`
  const cached = getCached<Article[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  let result: Article[] = []
  if (isD1Configured()) {
    try {
      const rows = await queryD1(
        "SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT ?",
        [limit]
      )
      result = rows.map(transformArticle)
    } catch (error) {
      console.warn('⚠️ Cloudflare D1 error fetching recent articles:', error)
    }
  }

  // Fallback to getAllArticles() slice if query returned empty or failed
  if (result.length === 0) {
    try {
      const all = await getAllArticles()
      const published = all.filter(a => a.status === 'published').slice(0, limit)
      if (published.length > 0) result = published
    } catch {}
  }

  if (result.length === 0) {
    result = localStore.getRecent(limit)
  }

  setCached(cacheKey, result)
  return result
}

// Get homepage articles (positions 1-15) - Cached
export async function getHomepageArticles(): Promise<Article[]> {
  const cacheKey = 'homepage_articles'
  const cached = getCached<Article[]>(cacheKey)
  if (cached && cached.length > 0) return cached

  let result: Article[] = []
  if (isD1Configured()) {
    try {
      const rows = await queryD1(
        "SELECT * FROM articles WHERE status = 'published' AND homepage_position >= 1 AND homepage_position <= 15 ORDER BY homepage_position ASC"
      )
      result = rows.map(transformArticle)
    } catch (error) {
      console.warn('⚠️ Cloudflare D1 error fetching homepage articles:', error)
    }
  }

  // Fallback to getAllArticles() if query returned empty or failed
  if (result.length === 0) {
    try {
      const all = await getAllArticles()
      const pinned = all.filter(a => a.status === 'published' && typeof a.homepage_position === 'number' && a.homepage_position >= 1 && a.homepage_position <= 15)
      if (pinned.length > 0) result = pinned
    } catch {}
  }

  if (result.length === 0) {
    result = localStore.getHomepage()
  }

  setCached(cacheKey, result)
  return result
}

// Get articles by specific broadsheet positions
export async function getArticlesByPosition(positions: number[]): Promise<Article[]> {
  if (isD1Configured()) {
    try {
      if (positions.length === 0) return []
      const placeholders = positions.map((_, i) => `?${i + 1}`).join(',')
      const rows = await queryD1(
        `SELECT * FROM articles WHERE status = 'published' AND homepage_position IN (${placeholders}) ORDER BY homepage_position ASC`,
        positions
      )
      return rows.map(transformArticle)
    } catch (error) {
      console.warn('⚠️ Cloudflare D1 error fetching articles by position, falling back to local store:', error)
      return localStore.getByPositions(positions)
    }
  }

  return localStore.getByPositions(positions)
}

// Get breaking news stories (is_breaking = true or homepage_position = 1)
export async function getBreakingArticles(): Promise<Article[]> {
  if (isD1Configured()) {
    try {
      const rows = await queryD1(
        "SELECT * FROM articles WHERE status = 'published' AND (is_breaking = 1 OR is_breaking = true OR homepage_position = 1) ORDER BY published_at DESC"
      )
      return rows.map(transformArticle)
    } catch (error) {
      console.warn('⚠️ Cloudflare D1 error fetching breaking articles, falling back to local store:', error)
      return localStore.getBreaking()
    }
  }

  return localStore.getBreaking()
}

// List articles with filtering, search, and pagination
export async function listArticles(options?: ListArticlesOptions): Promise<PaginatedArticles> {
  if (isD1Configured()) {
    try {
      const page = Math.max(1, options?.page || 1)
      const limit = Math.max(1, options?.limit || 20)
      const offset = options?.offset !== undefined ? options.offset : (page - 1) * limit

      const whereClauses: string[] = []
      const params: any[] = []
      let paramIndex = 1

      if (options?.status && options.status !== 'all') {
        whereClauses.push(`status = ?${paramIndex++}`)
        params.push(options.status)
      }

      if (options?.category) {
        whereClauses.push(`category = ?${paramIndex++}`)
        params.push(options.category)
      }

      if (options?.search) {
        whereClauses.push(`(title LIKE ?${paramIndex} OR excerpt LIKE ?${paramIndex} OR author LIKE ?${paramIndex})`)
        params.push(`%${options.search}%`)
        paramIndex++
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
      const orderBy = options?.orderBy === 'homepage_position' ? 'homepage_position' : 'published_at'
      const dir = options?.orderDirection === 'asc' ? 'ASC' : 'DESC'

      const countRows = await queryD1<{ count: number }>(`SELECT count(*) as count FROM articles ${whereSql}`, params)
      const total = countRows[0]?.count || 0

      const querySql = `SELECT * FROM articles ${whereSql} ORDER BY ${orderBy} ${dir} LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`
      const rows = await queryD1(querySql, [...params, limit, offset])

      return {
        articles: rows.map(transformArticle),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      }
    } catch (error) {
      console.warn('⚠️ Cloudflare D1 error listing articles, falling back to local store:', error)
      return localStore.list(options)
    }
  }

  return localStore.list(options)
}

// Create new article
export async function createArticle(input: CreateArticleInput): Promise<Article | null> {
  invalidateArticleCache()
  // Always update local store so local state remains synchronized
  const localResult = localStore.create(input)

  if (isD1Configured()) {
    try {
      const now = new Date().toISOString()
      const pubAt = input.published_at || (input.status === 'published' ? now : null)
      await executeD1(
        `INSERT INTO articles (
          id, title, slug, subtitle, excerpt, content, author, category,
          image_url, image_caption, video_url, featured, is_breaking, status,
          homepage_position, tags, language, created_at, updated_at, published_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)`,
        [
          localResult.id,
          input.title,
          input.slug || localResult.slug,
          input.subtitle || null,
          input.excerpt,
          input.content,
          input.author || 'Dhananjay Singh',
          input.category || 'World',
          input.image_url || input.imageUrl || '',
          input.image_caption || input.imageCaption || null,
          input.video_url !== undefined ? input.video_url : (input.videoUrl !== undefined ? input.videoUrl : null),
          input.featured ? 1 : 0,
          input.is_breaking ? 1 : 0,
          input.status || 'draft',
          typeof input.homepage_position === 'number' ? input.homepage_position : null,
          JSON.stringify(input.tags || []),
          input.language || 'english',
          now,
          now,
          pubAt,
        ]
      )
      return localResult
    } catch (err) {
      console.warn('⚠️ Cloudflare D1 error creating article, using local store:', err)
      return localResult
    }
  }

  return localResult
}

// Update existing article
export async function updateArticle(id: string, updates: UpdateArticleInput): Promise<Article | null> {
  invalidateArticleCache()
  const localResult = localStore.update(id, updates)

  if (isD1Configured()) {
    try {
      const existing = await getArticleById(id)
      if (existing) {
        const merged = { ...existing, ...updates, updated_at: new Date().toISOString() }
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
            merged.image_url || merged.imageUrl || '',
            merged.image_caption || merged.imageCaption || null,
            merged.video_url !== undefined ? merged.video_url : (merged.videoUrl !== undefined ? merged.videoUrl : null),
            merged.featured ? 1 : 0,
            merged.is_breaking ? 1 : 0,
            merged.status,
            typeof merged.homepage_position === 'number' ? merged.homepage_position : null,
            JSON.stringify(merged.tags || []),
            merged.language || 'english',
            merged.updated_at,
            merged.published_at || null,
            id,
          ]
        )
      }
      return localResult
    } catch (err) {
      console.warn('⚠️ Cloudflare D1 error updating article, using local store:', err)
      return localResult
    }
  }

  return localResult
}

// Delete article
export async function deleteArticle(id: string): Promise<boolean> {
  invalidateArticleCache()
  const localSuccess = localStore.delete(id)

  if (isD1Configured()) {
    try {
      await executeD1('DELETE FROM articles WHERE id = ?1', [id])
      return true
    } catch (err) {
      return localSuccess
    }
  }

  return localSuccess
}

// Set article status (draft / published / archived)
export async function setArticleStatus(id: string, status: ArticleStatus): Promise<Article | null> {
  return updateArticle(id, { status })
}

// Update homepage position (1-15, or null to unpin)
export async function updateArticlePosition(id: string, position: number | null): Promise<boolean> {
  invalidateArticleCache()
  const localSuccess = localStore.updatePosition(id, position)

  if (isD1Configured()) {
    try {
      if (position !== null && position >= 1 && position <= 15) {
        await executeD1('UPDATE articles SET homepage_position = NULL WHERE homepage_position = ?1', [position])
      }
      await executeD1('UPDATE articles SET homepage_position = ?1 WHERE id = ?2', [position, id])
      return true
    } catch (err) {
      return localSuccess
    }
  }

  return localSuccess
}

// Swap positions between two articles
export async function swapArticlePositions(id1: string, id2: string): Promise<boolean> {
  invalidateArticleCache()
  const localSuccess = localStore.swapPositions(id1, id2)

  if (isD1Configured()) {
    try {
      const a1 = await getArticleById(id1)
      const a2 = await getArticleById(id2)
      if (!a1 || !a2) return false
      const pos1 = a1.homepage_position
      const pos2 = a2.homepage_position
      await executeD1('UPDATE articles SET homepage_position = NULL WHERE id = ?1', [id1])
      await executeD1('UPDATE articles SET homepage_position = ?1 WHERE id = ?2', [pos1, id2])
      await executeD1('UPDATE articles SET homepage_position = ?2 WHERE id = ?1', [id1, pos2])
      return true
    } catch (err) {
      return localSuccess
    }
  }

  return localSuccess
}

// Get currently unassigned broadsheet positions (1-15)
export async function getAvailablePositions(): Promise<number[]> {
  if (isD1Configured()) {
    try {
      const rows = await queryD1<{ homepage_position: number }>(
        "SELECT homepage_position FROM articles WHERE status = 'published' AND homepage_position >= 1 AND homepage_position <= 15"
      )
      const usedPositions = rows.map(r => r.homepage_position).filter(p => typeof p === 'number')
      return Array.from({ length: 15 }, (_, i) => i + 1).filter((p) => !usedPositions.includes(p))
    } catch (err) {
      return localStore.getAvailablePositions()
    }
  }

  return localStore.getAvailablePositions()
}

// Verify admin credentials with local fallback
export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const fallbackUsername = process.env.ADMIN_USERNAME || 'admin'
  const fallbackPassword = process.env.ADMIN_PASSWORD || 'pass@123'
  return username === fallbackUsername && password === fallbackPassword
}
