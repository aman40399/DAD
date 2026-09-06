export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  imageUrl: string
  videoUrl?: string | null
  featured: boolean
  homepagePosition: number | null  // 1-20 for homepage, 0 for archived, null for unassigned
  createdAt: string
  updatedAt: string
  publishedAt: string
  tags: string[]
  language?: string  // 'english' or 'hindi'
}

export interface AdminUser {
  id: string
  username: string
  password: string
  created_at: string
}

// Database types (Supabase naming convention)
export interface DbArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  image_url: string
  video_url?: string | null
  featured: boolean
  homepage_position: number | null
  created_at: string
  updated_at: string
  published_at: string
  tags: string[]
  language?: string  // 'english' or 'hindi'
}

// Position section metadata
export interface PositionSection {
  position: number
  name: string
  description: string
  style: 'breaking' | 'hero-main' | 'hero-image' | 'card-large' | 'card-medium' | 'card-small' | 'spotlight' | 'compact'
}
