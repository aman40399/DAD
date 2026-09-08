import assert from 'node:assert/strict'
import test from 'node:test'

const BASE_URL = 'http://localhost:3000'

test('SEO & Google Ranking Overhaul', async (t) => {
  await t.test('GET /robots.txt serves Googlebot and Googlebot-News directives with sitemaps', async () => {
    const res = await fetch(`${BASE_URL}/robots.txt`)
    assert.equal(res.status, 200)
    const text = await res.text()
    assert.match(text, /Googlebot-News/)
    assert.match(text, /Sitemap: .*\/sitemap\.xml/)
    assert.match(text, /Sitemap: .*\/sitemap-news\.xml/)
  })

  await t.test('GET /sitemap.xml serves standard XML sitemap indexing articles & sections', async () => {
    const res = await fetch(`${BASE_URL}/sitemap.xml`)
    assert.equal(res.status, 200)
    const text = await res.text()
    assert.match(text, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
    assert.match(text, /\/article\//)
    assert.match(text, /\/section\/world/)
    assert.match(text, /\/section\/india/)
  })

  await t.test('GET /sitemap-news.xml serves Google News XML schema with publications', async () => {
    const res = await fetch(`${BASE_URL}/sitemap-news.xml`)
    assert.equal(res.status, 200)
    const text = await res.text()
    assert.match(text, /xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9"/)
    assert.match(text, /<news:name>Singh Monster<\/news:name>/)
    assert.match(text, /<news:publication_date>/)
    assert.match(text, /<news:title>/)
  })

  await t.test('GET /article/:slug includes rich NewsArticle JSON-LD schema & Dhananjay Singh as Admin', async () => {
    const res = await fetch(`${BASE_URL}/article/putin-talks-us-envoys-ukraine-pause-strikes`)
    assert.equal(res.status, 200)
    const text = await res.text()
    assert.match(text, /application\/ld\+json/)
    assert.match(text, /NewsArticle/)
    assert.match(text, /Dhananjay Singh/)
    assert.match(text, /Admin/)
    assert.match(text, /news_keywords/)
    assert.match(text, /authr\.png/)
  })
})

test('Device Push Notifications System', async (t) => {
  await t.test('GET /api/notifications/subscribe returns public VAPID key and subscriber count', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/subscribe`)
    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.success, true)
    assert.ok(data.publicKey.length > 30)
    assert.equal(typeof data.count, 'number')
  })

  await t.test('POST /api/notifications/subscribe registers a device subscription', async () => {
    const fakeSubscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-device-endpoint-' + Date.now(),
      expirationTime: null,
      keys: {
        p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t04ptTpqBoZ0CqaWjqx3mAJEBgM2',
        auth: 'tBHItJI5svbpez7KI4CCXg',
      },
    }

    const res = await fetch(`${BASE_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: fakeSubscription,
        userAgent: 'Mozilla/5.0 Test Browser',
        platform: 'Linux',
      }),
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.success, true)
    assert.equal(data.isNew, true)
    assert.ok(data.totalSubscribers >= 1)
  })

  await t.test('POST /api/notifications/broadcast delivers notifications and handles endpoints', async () => {
    const res = await fetch(`${BASE_URL}/api/notifications/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '🚨 Test Breaking News Alert',
        message: 'Dispatched by Dhananjay Singh to all devices.',
        url: '/article/putin-talks-us-envoys-ukraine-pause-strikes',
        isBreaking: true,
      }),
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.equal(data.success, true)
  })
})
