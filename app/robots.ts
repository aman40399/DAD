import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: ['Mediapartners-Google', 'AdsBot-Google'],
        allow: '/',
      },
      {
        userAgent: ['Googlebot', 'Googlebot-News', 'Googlebot-Image'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/bookmarks', '/search?*'],
      },
      {
        userAgent: ['Bingbot', 'msnbot', 'BingPreview'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/bookmarks', '/search?*'],
      },
      {
        userAgent: ['Applebot', 'DuckDuckBot', 'YandexBot', 'Baiduspider', 'Slurp'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/bookmarks', '/search?*'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/bookmarks', '/search?*'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemap-news.xml`,
    ],
    host: new URL(baseUrl).host,
  }
}

