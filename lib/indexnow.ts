export const INDEXNOW_KEY = 'c7f5399d8b314959a9041a996efefd39'
export const DEFAULT_HOST = 'www.singh.monster'
export const CANONICAL_BASE_URL = 'https://www.singh.monster'

export interface IndexNowResult {
  engine: string
  status: number
  ok: boolean
  message?: string
}

/**
 * Submits one or more URLs to search engines via the IndexNow protocol (Bing, Yandex, Seznam, Naver).
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult[]> {
  if (!urls || urls.length === 0) return []

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || CANONICAL_BASE_URL).replace(/\/$/, '')
  const host = new URL(baseUrl).hostname || DEFAULT_HOST

  // Ensure absolute URLs
  const absoluteUrls = urls.map((u) => {
    if (u.startsWith('http://') || u.startsWith('https://')) return u
    return `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`
  })

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
    urlList: absoluteUrls,
  }

  const endpoints = [
    { name: 'IndexNow Central', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Microsoft Bing', url: 'https://www.bing.com/indexnow' },
  ]

  const results: IndexNowResult[] = []

  for (const ep of endpoints) {
    try {
      const response = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      })

      let msg = response.status === 200 ? 'OK' : response.status === 202 ? 'Accepted' : `HTTP ${response.status}`
      if (response.status === 403) {
        msg = 'Key awaiting Bing crawler verification. Verify domain in Bing Webmaster Tools.'
      }

      results.push({
        engine: ep.name,
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        message: msg,
      })

    } catch (err: any) {
      results.push({
        engine: ep.name,
        status: 0,
        ok: false,
        message: err?.message || 'Network error',
      })
    }
  }

  return results
}

/**
 * Pings Google and Bing to refresh sitemaps.
 */
export async function pingSitemaps(): Promise<{ engine: string; status: number; ok: boolean }[]> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || CANONICAL_BASE_URL).replace(/\/$/, '')
  const sitemapUrl = encodeURIComponent(`${baseUrl}/sitemap.xml`)
  const sitemapNewsUrl = encodeURIComponent(`${baseUrl}/sitemap-news.xml`)

  const pingTargets = [
    { engine: 'Google Sitemap', url: `https://www.google.com/ping?sitemap=${sitemapUrl}` },
    { engine: 'Google News Sitemap', url: `https://www.google.com/ping?sitemap=${sitemapNewsUrl}` },
    { engine: 'Bing Sitemap', url: `https://www.bing.com/ping?sitemap=${sitemapUrl}` },
  ]

  const results = await Promise.all(
    pingTargets.map(async (t) => {
      try {
        const res = await fetch(t.url, { method: 'GET' })
        return { engine: t.engine, status: res.status, ok: res.status < 400 }
      } catch {
        return { engine: t.engine, status: 0, ok: false }
      }
    })
  )

  return results
}

/**
 * Asynchronous trigger to ping all engines when content is published or updated without blocking caller.
 */
export function triggerSearchEngineSync(urls: string[]) {
  // Fire and forget
  Promise.allSettled([
    submitToIndexNow(urls),
    pingSitemaps(),
  ]).catch((err) => {
    console.warn('⚠️ Background search engine sync notice:', err)
  })
}
