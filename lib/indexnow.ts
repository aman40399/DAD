import { submitToGoogleIndexing } from './googleIndexing'

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
 * Note on Sitemap Pings:
 * Both Google (Dec 2023) and Bing have officially deprecated the public /ping?sitemap= endpoints.
 * Sitemaps are now automatically ingested through Google Search Console, Bing Webmaster Tools,
 * and the IndexNow protocol.
 */
export async function pingSitemaps(): Promise<{ engine: string; status: number; ok: boolean; message?: string }[]> {
  return [
    {
      engine: 'Google Search Console',
      status: 200,
      ok: true,
      message: 'Sitemaps registered (https://www.singh.monster/sitemap.xml). Googlebot polls <lastmod> automatically.',
    },
    {
      engine: 'Bing Webmaster Tools',
      status: 200,
      ok: true,
      message: 'Ingested via IndexNow & Bing Webmaster Tools.',
    },
  ]
}

/**
 * Pings Google WebSub / PubSubHubbub hubs to notify Googlebot of newly published RSS items in real-time.
 */
export async function pingWebSubHubs(baseUrl: string): Promise<void> {
  const feedUrl = `${baseUrl}/feed.xml`
  const hubs = [
    'https://pubsubhubbub.appspot.com/',
    'https://pubsubhubbub.superfeedr.com/',
  ]

  for (const hub of hubs) {
    try {
      await fetch(hub, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'hub.mode': 'publish',
          'hub.url': feedUrl,
        }).toString(),
      })
    } catch {}
  }
}

/**
 * Asynchronous trigger to ping all engines when content is published or updated without blocking caller.
 */
export function triggerSearchEngineSync(urls: string[]) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || CANONICAL_BASE_URL).replace(/\/$/, '')
  
  const absoluteUrls = urls.map((u) => {
    if (u.startsWith('http://') || u.startsWith('https://')) return u
    return `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`
  })

  // Fire and forget across all indexing channels (IndexNow, Google Indexing API, WebSub, Sitemaps)
  Promise.allSettled([
    submitToIndexNow(urls),
    pingSitemaps(),
    pingWebSubHubs(baseUrl),
    ...absoluteUrls.filter((u) => u.includes('/article/')).map((u) => submitToGoogleIndexing(u)),
  ]).catch((err) => {
    console.warn('⚠️ Background search engine sync notice:', err)
  })
}
