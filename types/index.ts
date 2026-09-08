export type ArticleStatus = 'draft' | 'published' | 'archived'

export interface Article {
  id: string
  title: string
  slug: string
  subtitle?: string
  excerpt: string
  content: string
  author: string
  category: string
  image_url: string
  image_caption?: string
  video_url?: string | null
  featured?: boolean
  is_breaking?: boolean
  status: ArticleStatus
  homepage_position?: number | null // 1 to 15, or null
  tags: string[]
  language?: string // 'english' or 'hindi'
  created_at: string
  updated_at: string
  published_at: string

  // Backward-compatibility aliases for existing codebase & UI components
  imageUrl?: string
  imageCaption?: string
  videoUrl?: string | null
  homepagePosition?: number | null
  isBreaking?: boolean
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface AdminUser {
  id: string
  username: string
  password: string
  created_at: string
}

// Database types (Canonical schema)
export interface DbArticle {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  excerpt: string
  content: string
  author: string
  category: string
  image_url: string
  image_caption?: string | null
  video_url?: string | null
  featured: boolean
  is_breaking?: boolean
  status: ArticleStatus
  homepage_position: number | null
  created_at: string
  updated_at: string
  published_at: string
  tags: string[]
  language?: string
}

// Position section metadata
export interface PositionSection {
  position: number
  name: string
  description: string
  style: 'breaking' | 'hero-main' | 'hero-image' | 'card-large' | 'card-medium' | 'card-small' | 'spotlight' | 'compact'
}

// Query and Pagination Interfaces
export interface ListArticlesOptions {
  status?: ArticleStatus | 'all'
  category?: string
  search?: string
  tags?: string[]
  limit?: number
  page?: number
  offset?: number
  orderBy?: 'published_at' | 'created_at' | 'homepage_position' | 'title'
  orderDirection?: 'asc' | 'desc'
}

export interface PaginatedArticles {
  articles: Article[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CreateArticleInput = Omit<Article, 'id' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'> & {
  id?: string
  created_at?: string
  updated_at?: string
  published_at?: string
}

export type UpdateArticleInput = Partial<Omit<Article, 'id' | 'created_at' | 'updated_at'>>

// ===========================================================================
// Analytics & Regional Intelligence Data Models (Milestone 7)
// ===========================================================================

export type TimeRangeFilter = 'today' | '7d' | '30d' | 'all'

export type DeviceType = 'desktop' | 'mobile' | 'tablet'

export interface DeviceBreakdown {
  desktop: number
  mobile: number
  tablet: number
}

export interface GeoLocationData {
  countryCode: string
  countryName: string
  region?: string
  city?: string
}

export interface AnalyticsEvent {
  id: string
  path: string
  slug?: string
  title?: string
  country: string
  countryName: string
  region?: string
  city?: string
  referrer?: string
  referrerCategory?: string
  device: DeviceType
  sessionId: string
  timestamp: string
  durationSeconds?: number
}

export interface TimeSeriesPoint {
  date: string
  label: string
  views: number
  uniques: number
}

export interface CountryStat {
  code: string
  name: string
  views: number
  percentage: number
}

export interface ArticleStat {
  slug: string
  title: string
  category: string
  views: number
}

export interface ReferrerStat {
  source: string
  count: number
  percentage: number
}

export interface MetricTrend {
  value: number
  formatted: string
  isPositive: boolean
  current?: number
  previous?: number
  changePercentage?: number
}

export interface PeriodComparison {
  totalViews: number
  uniqueVisitors: number
  viewsGrowthPercentage: number
  uniquesGrowthPercentage: number
}

export interface AnalyticsStats {
  totalViews: number
  uniqueVisitors: number
  avgReadingTimeMinutes: number
  avgReadingTime?: number // Backward-compatibility alias
  publishedArticlesCount: number
  activeArticles?: number // Backward-compatibility alias
  pinnedSlotsCount: number
  pinnedSlots?: number // Backward-compatibility alias
  viewsOverTime?: TimeSeriesPoint[] // Backward-compatibility alias
  timeSeries: TimeSeriesPoint[]
  regionalBreakdown?: CountryStat[] // Backward-compatibility alias
  topCountries: CountryStat[]
  topArticles: ArticleStat[]
  referrerBreakdown?: ReferrerStat[] // Backward-compatibility alias
  topReferrers: ReferrerStat[]
  deviceBreakdown: DeviceBreakdown
  trends?: {
    views: MetricTrend
    uniques: MetricTrend
    readingTime: MetricTrend
  }
  previousPeriod?: PeriodComparison
}

export type AnalyticsSummary = AnalyticsStats

export interface CollectTelemetryInput {
  path?: string
  slug?: string
  title?: string
  sessionId?: string
  referrer?: string
  country?: string
  device?: DeviceType
  durationSeconds?: number
  timezone?: string
  locale?: string
  language?: string
}

