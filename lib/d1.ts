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

/**
 * Execute a parameterized SQL query against Cloudflare D1 via the official REST API
 */
export async function queryD1<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN
  const databaseId = getD1DatabaseId()

  if (!accountId || !token) {
    throw new Error('Cloudflare D1 credentials missing (CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN)')
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`

  const res = await fetch(endpoint, {
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
  const token = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN
  const databaseId = getD1DatabaseId()

  if (!accountId || !token) {
    throw new Error('Cloudflare D1 credentials missing')
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`

  const res = await fetch(endpoint, {
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
