/**
 * Test Server Manager & Interface Contract Mock Server.
 * Supports running E2E tests against live Next.js server or standalone mock server.
 */

import http from 'node:http'
import { SAMPLE_ENGLISH_ARTICLE, SAMPLE_HINDI_ARTICLE, SAMPLE_DRAFT_ARTICLE, SAMPLE_BREAKING_ARTICLE } from './articles.mjs'

export async function isServerAvailable(url, timeoutMs = 4000) {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal, method: 'HEAD' }).catch(async () => {
      return fetch(url, { signal: controller.signal, method: 'GET' })
    })
    clearTimeout(id)
    return res.status < 500
  } catch {
    return false
  }
}

/**
 * Creates an in-memory HTTP server strictly following PROJECT.md interface contracts.
 * Used for isolated contract validation and offline E2E test runs.
 */
export function createContractServer(port = 3099) {
  let articles = [
    {
      id: 'art-seed-1',
      slug: 'global-climate-summit-reaches-historic-agreement-on-coastal-defense-funding',
      ...SAMPLE_ENGLISH_ARTICLE,
      status: 'published',
      published_at: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'art-seed-2',
      slug: 'bharat-ne-antriksh-mission-mein-racha-naya-itihas',
      ...SAMPLE_HINDI_ARTICLE,
      status: 'published',
      published_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'art-seed-3',
      slug: 'breaking-global-monetary-council-announces-immediate-emergency-rate-adjustment',
      ...SAMPLE_BREAKING_ARTICLE,
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'art-seed-4',
      slug: 'confidential-internal-review-regional-transit-modernization-plan',
      ...SAMPLE_DRAFT_ARTICLE,
      status: 'draft',
      published_at: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  let pinnedSlots = new Map([
    [1, 'art-seed-3'], // Breaking Ticker
    [2, 'art-seed-1']  // Lead Hero
  ])

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const pathname = url.pathname

    const sendJson = (statusCode, obj) => {
      res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      })
      res.end(JSON.stringify(obj))
    }

    const sendHtml = (statusCode, html) => {
      res.writeHead(statusCode, {
        'Content-Type': 'text/html; charset=utf-8'
      })
      res.end(html)
    }

    const parseBody = async () => {
      const chunks = []
      for await (const chunk of req) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)
      try {
        return JSON.parse(buffer.toString())
      } catch {
        return buffer
      }
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
      })
      return res.end()
    }

    // --- Analytics API (Features 27-29) ---
    if (pathname === '/api/analytics/collect' && req.method === 'POST') {
      return sendJson(200, { ok: true })
    }

    if (pathname === '/api/analytics/stats' && req.method === 'GET') {
      return sendJson(200, {
        totalViews: 1250,
        uniqueVisitors: 980,
        avgReadingTimeMinutes: 3.8,
        publishedArticlesCount: articles.filter(a => a.status === 'published').length,
        pinnedSlotsCount: pinnedSlots.size,
        timeSeries: [
          { label: '09-01', date: '09-01', views: 180, uniques: 140 },
          { label: '09-02', date: '09-02', views: 195, uniques: 155 },
          { label: '09-03', date: '09-03', views: 210, uniques: 165 },
        ],
        topCountries: [
          { code: 'US', name: 'United States', views: 520, percentage: 42 },
          { code: 'GB', name: 'United Kingdom', views: 240, percentage: 19 },
          { code: 'IN', name: 'India', views: 190, percentage: 15 },
        ],
        topArticles: [
          { slug: 'japan-korea-defence-pact', title: 'Japan and South Korea Forge Defence Pact', category: 'World', views: 320 }
        ],
        topReferrers: [
          { source: 'Direct / Broadsheet Bookmark', count: 540, percentage: 43 }
        ],
        deviceBreakdown: { desktop: 780, mobile: 420, tablet: 50 }
      })
    }

    // --- Admin Auth ---
    if (pathname === '/api/admin/auth' && req.method === 'POST') {
      const body = await parseBody()
      if (body.username === 'admin' && body.password === 'meridian123') {
        res.setHeader('Set-Cookie', 'admin_session=valid_token; Path=/; HttpOnly')
        return sendJson(200, { success: true, message: 'Authenticated' })
      }
      return sendJson(401, { success: false, error: 'Invalid credentials' })
    }

    // --- Positions API (Feature 15) ---
    if (pathname === '/api/admin/positions') {
      if (req.method === 'GET') {
        const slots = []
        for (let i = 1; i <= 15; i++) {
          const articleId = pinnedSlots.get(i)
          const article = articleId ? articles.find(a => a.id === articleId) : null
          slots.push({
            slot: i,
            name: i === 1 ? 'Breaking Ticker' : i === 2 ? 'Lead Hero Story' : `Slot ${i}`,
            article: article ? { id: article.id, title: article.title, slug: article.slug } : null,
            isPinned: !!article
          })
        }
        return sendJson(200, { slots })
      }
    }

    if (pathname === '/api/admin/positions/pin' && req.method === 'POST') {
      const body = await parseBody()
      const { articleId, slotNumber } = body
      if (!articleId || !slotNumber || slotNumber < 1 || slotNumber > 15) {
        return sendJson(400, { error: 'Invalid slotNumber (must be 1-15) or missing articleId' })
      }
      const article = articles.find(a => a.id === articleId)
      if (!article) {
        return sendJson(404, { error: 'Article not found' })
      }
      pinnedSlots.set(Number(slotNumber), articleId)
      article.homepagePosition = Number(slotNumber)
      article.homepage_position = Number(slotNumber)
      return sendJson(200, { success: true, slot: Number(slotNumber), articleId })
    }

    if (pathname === '/api/admin/positions/unpin' && req.method === 'POST') {
      const body = await parseBody()
      const { slotNumber } = body
      if (!slotNumber || slotNumber < 1 || slotNumber > 15) {
        return sendJson(400, { error: 'Invalid slotNumber (must be 1-15)' })
      }
      const existingId = pinnedSlots.get(Number(slotNumber))
      if (existingId) {
        const art = articles.find(a => a.id === existingId)
        if (art) {
          art.homepagePosition = null
          art.homepage_position = null
        }
      }
      const existed = pinnedSlots.delete(Number(slotNumber))
      return sendJson(200, { success: true, unpinned: existed, slot: Number(slotNumber) })
    }

    // --- Media Upload API (Feature 7) ---
    if (pathname === '/api/media/upload' && req.method === 'POST') {
      const contentType = req.headers['content-type'] || ''
      if (!contentType.includes('multipart/form-data')) {
        return sendJson(400, { error: 'Expected multipart/form-data' })
      }
      const rawBody = await parseBody()
      const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('latin1') : ''

      // Validate MIME type
      if (bodyStr.includes('Content-Type: text/plain') || bodyStr.includes('filename="document.txt"')) {
        return sendJson(415, { error: 'Unsupported Media Type: Only image formats are accepted' })
      }

      // Validate non-empty file
      if (bodyStr.includes('filename="empty.webp"') || rawBody.length < 50) {
        return sendJson(400, { error: 'File payload is empty or invalid' })
      }

      const key = `media/${Date.now()}-mock-upload.webp`
      return sendJson(200, {
        url: `https://pub-r2.meridian-news.test/${key}`,
        key,
        aspectRatio: '16:10',
        filename: 'mock-upload.webp',
        size: 1024
      })
    }

    // --- Media Archive Listing API ---
    if (pathname === '/api/media' && req.method === 'GET') {
      const mediaList = articles.filter(a => a.imageUrl || a.image_url).map(a => ({
        id: `media-${a.id}`,
        url: a.imageUrl || a.image_url,
        title: a.title,
        source: 'article',
        aspectRatio: '16:10',
        createdAt: a.createdAt || a.created_at || new Date().toISOString()
      }))
      return sendJson(200, { success: true, count: mediaList.length, media: mediaList })
    }

    // --- Articles REST API (Features 4, 5) ---
    if (pathname === '/api/articles') {
      if (req.method === 'GET') {
        const statusFilter = url.searchParams.get('status')
        const categoryFilter = url.searchParams.get('category')
        let result = [...articles]
        if (statusFilter) result = result.filter(a => a.status === statusFilter)
        if (categoryFilter) result = result.filter(a => a.category.toLowerCase() === categoryFilter.toLowerCase())
        return sendJson(200, { articles: result, total: result.length })
      }

      if (req.method === 'POST') {
        const body = await parseBody()
        if (!body.title) {
          return sendJson(400, { error: 'Title is required' })
        }
        // Slug generation
        let slug = body.slug || body.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        let collisionCount = 0
        let uniqueSlug = slug
        while (articles.some(a => a.slug === uniqueSlug)) {
          collisionCount++
          uniqueSlug = `${slug}-${collisionCount}`
        }

        const newArticle = {
          id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: body.title,
          slug: uniqueSlug,
          subtitle: body.subtitle || '',
          excerpt: body.excerpt || '',
          content: body.content || '',
          author: body.author || 'Anonymous',
          category: body.category || 'General',
          imageUrl: body.imageUrl || body.image_url || '',
          imageCaption: body.imageCaption || body.image_caption || '',
          videoUrl: body.videoUrl || body.video_url || null,
          featured: !!body.featured,
          isBreaking: !!body.isBreaking || !!body.is_breaking,
          status: body.status || 'draft',
          homepagePosition: body.homepagePosition ?? null,
          tags: Array.isArray(body.tags) ? body.tags : [],
          language: body.language || 'english',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: body.status === 'published' ? new Date().toISOString() : ''
        }
        articles.push(newArticle)
        return sendJson(201, { article: newArticle })
      }
    }

    // Single article route /api/articles/:id
    const articleIdMatch = pathname.match(/^\/api\/articles\/([^/]+)$/)
    if (articleIdMatch) {
      const id = articleIdMatch[1]
      const articleIdx = articles.findIndex(a => a.id === id)

      if (req.method === 'GET') {
        if (articleIdx === -1) return sendJson(404, { error: 'Article not found' })
        return sendJson(200, { article: articles[articleIdx] })
      }

      if (req.method === 'PUT') {
        if (articleIdx === -1) return sendJson(404, { error: 'Article not found' })
        const body = await parseBody()
        if (body.status === 'published' && !articles[articleIdx].published_at) {
          body.published_at = new Date().toISOString()
        }
        articles[articleIdx] = {
          ...articles[articleIdx],
          ...body,
          updated_at: new Date().toISOString()
        }
        return sendJson(200, { article: articles[articleIdx] })
      }

      if (req.method === 'DELETE') {
        if (articleIdx === -1) return sendJson(404, { error: 'Article not found' })
        const deleted = articles.splice(articleIdx, 1)[0]
        return sendJson(200, { success: true, deletedId: deleted.id })
      }
    }

    // --- Public Article Reader Route /article/:slug (Feature 20) ---
    const articleSlugMatch = pathname.match(/^\/article\/([^/]+)$/)
    if (articleSlugMatch && req.method === 'GET') {
      const slug = decodeURIComponent(articleSlugMatch[1])
      const article = articles.find(a => a.slug === slug)

      // Gated: 404 for missing or draft articles
      if (!article || article.status !== 'published') {
        return sendHtml(404, `<!DOCTYPE html><html><head><title>404 - Article Not Found</title></head><body><h1>404 Not Found</h1></body></html>`)
      }

      // Render reader HTML with Meridian aesthetic
      const sanitizedContent = (article.content || '')
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\bon\w+="[^"]*"/gi, '')

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${article.title} - The Meridian</title>
  <meta name="description" content="${article.excerpt}">
</head>
<body class="bg-[#FBFBF9] text-[#111111] font-serif">
  <header class="border-b border-[#E5E5E0] py-4">
    <div class="text-3xl font-black text-center tracking-wider font-serif">THE MERIDIAN</div>
    <div class="text-xs text-center text-[#666660] mt-1">VOL. CXLIV ... NO. 52,109</div>
  </header>
  <main class="max-w-4xl mx-auto px-4 py-8">
    <div class="text-xs uppercase font-bold tracking-wider text-[#990000] mb-2">${article.category}</div>
    <h1 class="text-4xl sm:text-5xl font-serif font-bold text-[#111111] leading-tight mb-4">${article.title}</h1>
    ${article.subtitle ? `<div class="text-xl italic text-[#444440] mb-6 font-serif">${article.subtitle}</div>` : ''}
    <div class="flex items-center justify-between border-y border-[#E5E5E0] py-3 my-6 text-sm text-[#666660]">
      <div class="font-sans">By <span class="font-bold text-[#111111]">${article.author}</span></div>
      <div class="flex items-center gap-4">
        <span class="reading-time">3 min read</span>
        <button aria-label="Bookmark this article" class="bookmark-btn">Bookmark</button>
      </div>
    </div>
    ${article.imageUrl ? `
      <figure class="my-6">
        <img src="${article.imageUrl}" alt="${article.title}" class="w-full aspect-[16/10] object-cover" />
        ${article.imageCaption ? `<figcaption class="text-xs text-[#666660] mt-2 italic font-sans">${article.imageCaption}</figcaption>` : ''}
      </figure>
    ` : ''}
    <article class="prose max-w-none font-serif text-lg leading-relaxed text-[#222220]">
      <div class="lead-paragraph first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:font-serif drop-cap">
        ${sanitizedContent}
      </div>
    </article>
    <section class="related-stories mt-12 border-t-2 border-[#111111] pt-6">
      <h3 class="text-lg font-bold uppercase tracking-wider mb-4">Related Stories</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Related rail items -->
      </div>
    </section>
  </main>
</body>
</html>`
      return sendHtml(200, html)
    }

    // --- Homepage Route / (Features 17, 18, 19) ---
    if (pathname === '/' && req.method === 'GET') {
      const breakingArticleId = pinnedSlots.get(1)
      const breakingArticle = breakingArticleId
        ? articles.find(a => a.id === breakingArticleId && a.status === 'published')
        : articles.find(a => (a.isBreaking || a.is_breaking) && a.status === 'published')

      const heroArticleId = pinnedSlots.get(2)
      const heroArticle = heroArticleId
        ? articles.find(a => a.id === heroArticleId && a.status === 'published')
        : articles.find(a => (a.homepagePosition === 2 || a.homepage_position === 2) && a.status === 'published') || articles[0]

      const html = `<!DOCTYPE html>
<html lang="en">
<head><title>The Meridian - Daily Broadsheet</title></head>
<body class="bg-[#FBFBF9] font-serif">
  ${breakingArticle ? `
    <div class="bg-[#990000] text-white py-2 px-4 ticker">
      <span class="font-bold uppercase mr-2">BREAKING</span>
      <a href="/article/${breakingArticle.slug}" class="underline">${breakingArticle.title}</a>
    </div>
  ` : ''}
  <header class="py-6 border-b border-[#E5E5E0]">
    <div class="text-center text-4xl font-bold font-serif">THE MERIDIAN</div>
  </header>
  <main class="max-w-7xl mx-auto px-4 py-6">
    <div class="grid grid-cols-12 gap-6">
      <!-- Slot 2: Lead Hero Story -->
      <div class="col-span-8 lead-hero-slot">
        <h2 class="text-3xl font-bold mb-2">
          <a href="/article/${heroArticle?.slug}">${heroArticle?.title}</a>
        </h2>
        <p class="text-base text-[#444440]">${heroArticle?.excerpt}</p>
      </div>
    </div>
  </main>
</body>
</html>`
      return sendHtml(200, html)
    }

    // Default 404
    sendHtml(404, '<h1>404 Not Found</h1>')
  })

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve({
        server,
        port,
        baseUrl: `http://localhost:${port}`,
        close: () => new Promise(cb => server.close(cb)),
        resetArticles: (newArticles) => { articles = [...newArticles] },
        setPinnedSlots: (map) => { pinnedSlots = new Map(map) }
      })
    })
  })
}
