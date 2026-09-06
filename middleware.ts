import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// MIDDLEWARE FOR 301 REDIRECTS FROM OLD WEBSITE
// ============================================================================
// This handles permanent redirects from your old website structure to the new one
// This is CRITICAL for SEO to:
// 1. Prevent duplicate content penalties
// 2. Transfer old page authority to new pages
// 3. Maintain user bookmarks and external links
// 4. Remove old indexed pages from Google Search Console

// ============================================================================
// STEP 1: CUSTOMIZE THIS MAPPING WITH YOUR OLD URLS
// ============================================================================
// Add your actual old website URL patterns below
// Format: '/old-path': '/new-path'
// 
// Example patterns for common CMS structures:
// WordPress: '/yyyy/mm/dd/post-name' → '/article/post-name'
// Blogger: '/yyyy/mm/post-name.html' → '/article/post-name'
// Ghost: '/blog/post-name' → '/article/post-name'

const oldToNewRedirects: Record<string, string> = {
  // ===== EXAMPLE PATTERNS (REPLACE WITH YOUR ACTUAL OLD URLS) =====
  
  // Blog posts
  '/old-blog': '/article',
  '/post': '/article',
  '/blog': '/article',
  '/news': '/section/world',
  
  // Categories
  '/category': '/section',
  '/category/tech': '/section/technology',
  '/category/politics': '/section/politics',
  '/category/business': '/section/business',
  '/category/sports': '/section/sports',
  '/category/entertainment': '/section/culture',
  
  // Tags
  '/tag': '/search',
  
  // Authors
  '/author': '/author',
  
  // Static pages (if any)
  '/about-us': '/about',
  '/contact-us': '/about',
  
  // ===== ADD YOUR SPECIFIC OLD URLS HERE =====
  // Get these from:
  // 1. Google Search Console → Coverage → Excluded → 404 errors
  // 2. Old website sitemap.xml
  // 3. Google Analytics → Behavior → Site Content → All Pages
  // 4. Server access logs
  
  // Example specific redirects:
  // '/2023/12/01/breaking-news-title': '/article/breaking-news-title',
  // '/politics/election-analysis': '/article/election-analysis',
  // '/tech-news/ai-revolution': '/article/ai-revolution',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname matches any old URL pattern
  for (const [oldPath, newPath] of Object.entries(oldToNewRedirects)) {
    if (pathname.startsWith(oldPath)) {
      const newUrl = request.nextUrl.clone()
      newUrl.pathname = pathname.replace(oldPath, newPath)
      return NextResponse.redirect(newUrl, 301) // 301 = Permanent redirect
    }
  }

  // Redirect www to non-www (or vice versa)
  const hostname = request.headers.get('host')
  if (hostname?.startsWith('www.')) {
    const newUrl = request.nextUrl.clone()
    newUrl.host = hostname.replace('www.', '')
    return NextResponse.redirect(newUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
