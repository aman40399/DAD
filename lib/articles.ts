import { Article } from '@/types'
import { supabase } from './supabase'

// Transform database row to Article type (snake_case → camelCase)
function transformArticle(data: any): Article {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    author: data.author,
    category: data.category,
    imageUrl: data.image_url,
    videoUrl: data.video_url,
    featured: data.featured,
    homepagePosition: data.homepage_position,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    publishedAt: data.published_at,
    tags: data.tags,
    language: data.language || 'english',
  }
}

// Get all articles
export async function getAllArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })

    if (error) throw error
    return data?.map(transformArticle) || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

// Get article by ID
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? transformArticle(data) : null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

// Get article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data ? transformArticle(data) : null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

// Get articles by category
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data?.map(transformArticle) || []
  } catch (error) {
    console.error('Error fetching articles by category:', error)
    return []
  }
}

// Get featured articles
export async function getFeaturedArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('featured', true)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data?.map(transformArticle) || []
  } catch (error) {
    console.error('Error fetching featured articles:', error)
    return []
  }
}

// Get recent articles
export async function getRecentArticles(limit: number = 10): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data?.map(transformArticle) || []
  } catch (error) {
    console.error('Error fetching recent articles:', error)
    return []
  }
}

// Create article
export async function createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert([{
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        category: article.category,
        image_url: article.imageUrl,
        video_url: article.videoUrl,
        featured: article.featured,
        homepage_position: article.homepagePosition,
        published_at: article.publishedAt,
        tags: article.tags,
        language: article.language || 'english',
      }])
      .select()
      .single()

    if (error) throw error
    return data ? transformArticle(data) : null
  } catch (error) {
    console.error('Error creating article:', error)
    return null
  }
}

// Update article
export async function updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
  try {
    const updateData: any = {}
    
    if (updates.title) updateData.title = updates.title
    if (updates.slug) updateData.slug = updates.slug
    if (updates.excerpt) updateData.excerpt = updates.excerpt
    if (updates.content) updateData.content = updates.content
    if (updates.author) updateData.author = updates.author
    if (updates.category) updateData.category = updates.category
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl
    if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl
    if (updates.featured !== undefined) updateData.featured = updates.featured
    if (updates.homepagePosition !== undefined) updateData.homepage_position = updates.homepagePosition
    if (updates.publishedAt) updateData.published_at = updates.publishedAt
    if (updates.tags) updateData.tags = updates.tags
    if (updates.language) updateData.language = updates.language

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data ? transformArticle(data) : null
  } catch (error) {
    console.error('Error updating article:', error)
    return null
  }
}

// Delete article
export async function deleteArticle(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting article:', error)
    return false
  }
}

// Verify admin credentials
export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error) throw error
    return !!data
  } catch (error) {
    console.error('Error verifying admin:', error)
    return false
  }
}

// Get articles by homepage position
export async function getArticlesByPosition(positions: number[]): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .in('homepage_position', positions)
      .order('homepage_position', { ascending: true })

    if (error) throw error
    return data?.map(transformArticle) || []
  } catch (error) {
    console.error('Error fetching articles by position:', error)
    return []
  }
}

// Get all homepage articles (positions 1-20)
export async function getHomepageArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .gte('homepage_position', 1)
      .lte('homepage_position', 20)
      .order('homepage_position', { ascending: true })

    if (error) throw error
    return data?.map(transformArticle) || []
  } catch (error) {
    console.error('Error fetching homepage articles:', error)
    return []
  }
}

// Get archived articles (position 0) with pagination
export async function getArchivedArticles(page: number = 1, limit: number = 20): Promise<{ articles: Article[], total: number }> {
  try {
    const offset = (page - 1) * limit
    
    // Get total count
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('homepage_position', 0)
    
    // Get paginated articles
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('homepage_position', 0)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return {
      articles: data?.map(transformArticle) || [],
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching archived articles:', error)
    return { articles: [], total: 0 }
  }
}

// Get available homepage positions (not currently assigned)
export async function getAvailablePositions(): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('homepage_position')
      .gte('homepage_position', 1)
      .lte('homepage_position', 20)

    if (error) throw error
    
    const usedPositions = data?.map(a => a.homepage_position).filter(p => p !== null) || []
    const allPositions = Array.from({ length: 20 }, (_, i) => i + 1)
    return allPositions.filter(p => !usedPositions.includes(p))
  } catch (error) {
    console.error('Error fetching available positions:', error)
    return []
  }
}

// Update article position
export async function updateArticlePosition(id: string, position: number | null): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('articles')
      .update({ homepage_position: position })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating article position:', error)
    return false
  }
}

// Swap positions of two articles (for drag & drop)
export async function swapArticlePositions(id1: string, id2: string): Promise<boolean> {
  try {
    // Get both articles
    const { data: article1 } = await supabase
      .from('articles')
      .select('homepage_position')
      .eq('id', id1)
      .single()
    
    const { data: article2 } = await supabase
      .from('articles')
      .select('homepage_position')
      .eq('id', id2)
      .single()

    if (!article1 || !article2) return false

    const pos1 = article1.homepage_position
    const pos2 = article2.homepage_position

    // Temporarily set one to negative to avoid unique constraint
    await supabase
      .from('articles')
      .update({ homepage_position: -1 })
      .eq('id', id1)

    // Update second article
    await supabase
      .from('articles')
      .update({ homepage_position: pos1 })
      .eq('id', id2)

    // Update first article
    const { error } = await supabase
      .from('articles')
      .update({ homepage_position: pos2 })
      .eq('id', id1)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error swapping article positions:', error)
    return false
  }
}
