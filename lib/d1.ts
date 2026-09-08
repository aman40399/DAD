/**
 * Cloudflare D1 REST Client
 * Allows querying Cloudflare D1 serverless SQL database directly from Vercel or Node.js runtimes.
 */

const DEFAULT_DATABASE_ID = '9f866cf2-45ef-473f-b1b9-658343ec6ec8' // From wrangler.jsonc (singh-monster-db)

export function isD1Configured(): boolean {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN
  return Boolean(accountId && token)
}

export function getD1DatabaseId(): string {
  return process.env.CLOUDFLARE_D1_DATABASE_ID || DEFAULT_DATABASE_ID
}

export interface D1QueryResult<T = any> {
  results: T[]
  success: boolean
  meta?: {
    changed_db?: boolean
    changes?: number
    duration?: number
    last_row_id?: number
    rows_read?: number
    rows_written?: number
  }
}

let activeToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN || ''
let activeRefreshToken = process.env.CLOUDFLARE_REFRESH_TOKEN || ''

export async function refreshCloudflareToken(): Promise<string> {
  const refreshToken = process.env.CLOUDFLARE_REFRESH_TOKEN || activeRefreshToken
  if (!refreshToken) return activeToken || process.env.CLOUDFLARE_API_TOKEN || ''

  try {
    const res = await fetch('https://dash.cloudflare.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: '54d11594-84e4-41aa-b438-e81b8fa78ee7',
        refresh_token: refreshToken,
      }),
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      if (data.access_token) {
        activeToken = data.access_token
        process.env.CLOUDFLARE_API_TOKEN = data.access_token
        if (data.refresh_token) {
          activeRefreshToken = data.refresh_token
          process.env.CLOUDFLARE_REFRESH_TOKEN = data.refresh_token
        }
        return activeToken
      }
    }
  } catch (err) {
    console.error('Failed to auto-refresh Cloudflare token:', err)
  }
  return activeToken || process.env.CLOUDFLARE_API_TOKEN || ''
}

/**
 * Execute a parameterized SQL query against Cloudflare D1 via the official REST API
 */
export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  let token = activeToken || process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN
  const databaseId = getD1DatabaseId()

  if (!accountId || !token) {
    throw new Error('Cloudflare D1 credentials missing (CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN)')
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`

  let res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params,
    }),
    cache: 'no-store',
  })

  // Auto-refresh token if expired (401/403)
  if ((res.status === 401 || res.status === 403) && (process.env.CLOUDFLARE_REFRESH_TOKEN || activeRefreshToken)) {
    token = await refreshCloudflareToken()
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params,
      }),
      cache: 'no-store',
    })
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`D1 API HTTP ${res.status}: ${text}`)
  }

  const payload = await res.json()
  if (!payload.success) {
    throw new Error(`D1 Query Error: ${JSON.stringify(payload.errors || payload.messages)}`)
  }

  const queryResult = payload.result?.[0] as D1QueryResult<T> | undefined
  return queryResult?.results || []
}

/**
 * Execute an INSERT / UPDATE / DELETE statement on D1 and return meta
 */
export async function executeD1(sql: string, params: any[] = []): Promise<{ success: boolean; changes: number }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  let token = activeToken || process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN
  const databaseId = getD1DatabaseId()

  if (!accountId || !token) {
    throw new Error('Cloudflare D1 credentials missing')
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`

  let res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params,
    }),
    cache: 'no-store',
  })

  // Auto-refresh token if expired (401/403)
  if ((res.status === 401 || res.status === 403) && (process.env.CLOUDFLARE_REFRESH_TOKEN || activeRefreshToken)) {
    token = await refreshCloudflareToken()
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params,
      }),
      cache: 'no-store',
    })
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`D1 API HTTP ${res.status}: ${text}`)
  }

  const payload = await res.json()
  if (!payload.success) {
    throw new Error(`D1 Execution Error: ${JSON.stringify(payload.errors || payload.messages)}`)
  }

  const queryResult = payload.result?.[0] as D1QueryResult | undefined
  return {
    success: true,
    changes: queryResult?.meta?.changes || 0,
  }
}
