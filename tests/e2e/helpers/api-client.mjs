/**
 * API Client for Meridian News E2E Test Suite.
 * Interacts with HTTP server endpoints as an opaque client.
 */

export const DEFAULT_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

export class MeridianApiClient {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.authCookie = null
  }

  async rawFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`
    const headers = { ...options.headers }
    if (this.authCookie) {
      headers['Cookie'] = this.authCookie
    }
    return fetch(url, { ...options, headers })
  }

  async fetchJson(path, options = {}) {
    const res = await this.rawFetch(path, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      }
    })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { rawText: text }
    }
    return { status: res.status, headers: res.headers, data, ok: res.ok }
  }

  // --- Article CRUD API (Features 1, 4, 5) ---

  async getArticles(query = {}) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) params.set(k, String(v))
    }
    const qs = params.toString() ? `?${params.toString()}` : ''
    return this.fetchJson(`/api/articles${qs}`)
  }

  async getArticleById(id) {
    return this.fetchJson(`/api/articles/${id}`)
  }

  async createArticle(payload) {
    return this.fetchJson('/api/articles', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  async updateArticle(id, updates) {
    return this.fetchJson(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async deleteArticle(id) {
    return this.fetchJson(`/api/articles/${id}`, {
      method: 'DELETE'
    })
  }

  // --- Media Upload API (Features 6, 7, 9) ---

  async uploadMedia(bufferOrBlob, { filename = 'image.webp', mimeType = 'image/webp', aspectRatio = '16:10' } = {}) {
    const formData = new FormData()
    const blob = bufferOrBlob instanceof Blob ? bufferOrBlob : new Blob([bufferOrBlob], { type: mimeType })
    formData.append('file', blob, filename)
    if (aspectRatio) {
      formData.append('aspectRatio', aspectRatio)
    }

    const res = await this.rawFetch('/api/media/upload', {
      method: 'POST',
      body: formData
    })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { rawText: text }
    }
    return { status: res.status, headers: res.headers, data, ok: res.ok }
  }

  // --- Broadsheet Position API (Features 15, 17, 18, 19) ---

  async getPositions() {
    return this.fetchJson('/api/admin/positions')
  }

  async pinPosition(articleId, slotNumber) {
    return this.fetchJson('/api/admin/positions/pin', {
      method: 'POST',
      body: JSON.stringify({ articleId, slotNumber })
    })
  }

  async unpinPosition(slotNumber) {
    return this.fetchJson('/api/admin/positions/unpin', {
      method: 'POST',
      body: JSON.stringify({ slotNumber })
    })
  }

  // --- Admin Auth (Feature 11) ---

  async adminLogin(username, password) {
    const res = await this.fetchJson('/api/admin/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    if (res.ok && res.headers.get('set-cookie')) {
      this.authCookie = res.headers.get('set-cookie')
    }
    return res
  }

  // --- Public Page HTML Fetching (Features 20, 21, 22, 23, 24, 25, 26) ---

  async getHomepageHtml() {
    const res = await this.rawFetch('/')
    const html = await res.text()
    return { status: res.status, html, ok: res.ok }
  }

  async getArticlePageHtml(slug) {
    const res = await this.rawFetch(`/article/${encodeURIComponent(slug)}`)
    const html = await res.text()
    return { status: res.status, html, ok: res.ok }
  }

  async getAdminPageHtml(subpath = '') {
    const res = await this.rawFetch(`/admin${subpath}`)
    const html = await res.text()
    return { status: res.status, html, ok: res.ok }
  }
}
