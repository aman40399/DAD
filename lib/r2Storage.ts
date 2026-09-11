import { Article } from '@/types'
import { SEED_ARTICLES } from './seedData'
import { cloudGet, cloudPut, CLOUD_KEYS, isCloudConfigured, invalidateCloudCache } from './backend/cloudStore'

export { isCloudConfigured }
export const isR2Configured = isCloudConfigured

export function invalidateR2Cache(): void {
  invalidateCloudCache(CLOUD_KEYS.ARTICLES)
}

/**
 * Fetch all articles from Cloudflare R2 persistent storage.
 * Automatically seeds R2 if the file does not exist yet.
 */
export async function loadArticlesFromR2(): Promise<Article[]> {
  const articles = await cloudGet<Article[]>(CLOUD_KEYS.ARTICLES)
  if (Array.isArray(articles) && articles.length > 0) {
    return articles
  }

  // If cloud storage is empty, initialize with seed articles
  console.log('⚡ Initializing cloud database with seed articles...')
  if (SEED_ARTICLES && SEED_ARTICLES.length > 0) {
    await saveArticlesToR2(SEED_ARTICLES as Article[])
    return SEED_ARTICLES as Article[]
  }

  return []
}

/**
 * Save updated article list to Cloudflare R2 persistent storage.
 */
export async function saveArticlesToR2(articles: Article[]): Promise<boolean> {
  const success = await cloudPut(CLOUD_KEYS.ARTICLES, articles)
  if (success) {
    console.log(`✅ [CloudStore] Successfully saved ${articles.length} articles to cloud database.`)
  } else {
    console.error('❌ [CloudStore] Failed to save articles to cloud database.')
  }
  return success
}
