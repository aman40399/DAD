/**
 * @deprecated localStore is deprecated. All operations now run on the permanent Cloud Backend (lib/backend/cloudStore.ts & lib/articles.ts).
 * This module is maintained solely for backward compatibility with any legacy imports.
 */
import { Article, ArticleStatus, CreateArticleInput, ListArticlesOptions, PaginatedArticles, UpdateArticleInput } from '@/types'
import { SEED_ARTICLES } from './seedData'
import { transformArticle } from './articles'

declare global {
  var __meridian_articles_store__: Article[] | undefined
}

function getStore(): Article[] {
  if (!globalThis.__meridian_articles_store__ || globalThis.__meridian_articles_store__.length === 0) {
    globalThis.__meridian_articles_store__ = (SEED_ARTICLES || []).map(transformArticle)
  }
  return globalThis.__meridian_articles_store__
}

function setStore(articles: Article[]): void {
  globalThis.__meridian_articles_store__ = articles
}

export const localStore = {
  setAll(articles: Article[]): void {
    setStore(articles)
  },

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
    const created = transformArticle(input)
    getStore().unshift(created)
    return created
  },

  update(id: string, updates: UpdateArticleInput): Article | null {
    const store = getStore()
    const index = store.findIndex((a) => a.id === id)
    if (index === -1) return null
    const merged = transformArticle({ ...store[index], ...updates, id })
    store[index] = merged
    return merged
  },

  delete(id: string): boolean {
    const store = getStore()
    const idx = store.findIndex(a => a.id === id)
    if (idx !== -1) {
      store.splice(idx, 1)
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
    a2.homepage_position = pos1
    return true
  },

  reset(): void {
    const initial = (SEED_ARTICLES || []).map(transformArticle)
    setStore(initial)
  },
}
