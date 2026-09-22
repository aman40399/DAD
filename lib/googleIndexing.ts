import crypto from 'crypto'

export interface GoogleIndexingResult {
  engine: string
  url: string
  status: number
  ok: boolean
  message: string
}

interface ServiceAccountCredentials {
  client_email: string
  private_key: string
}

function getGoogleCredentials(): ServiceAccountCredentials | null {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim()
      const jsonStr = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')
      const parsed = JSON.parse(jsonStr)
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email,
          private_key: parsed.private_key.replace(/\\n/g, '\n'),
        }
      }
    } catch (e) {
      console.warn('⚠️ [GoogleIndexing] Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', e)
    }
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  if (clientEmail && privateKey) {
    return {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    }
  }

  return null
}

export function isGoogleIndexingConfigured(): boolean {
  return Boolean(getGoogleCredentials())
}

/**
 * Creates a signed JWT for Google OAuth2 service account authentication
 */
function createSignedJwt(credentials: ServiceAccountCredentials, scope: string): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const claimSet = {
    iss: credentials.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedClaim = Buffer.from(JSON.stringify(claimSet)).toString('base64url')
  const dataToSign = `${encodedHeader}.${encodedClaim}`

  const signer = crypto.createSign('RSA-SHA256')
  signer.update(dataToSign)
  const signature = signer.sign(credentials.private_key, 'base64url')

  return `${dataToSign}.${signature}`
}

/**
 * Retrieves a bearer token from Google OAuth2
 */
async function getGoogleAccessToken(credentials: ServiceAccountCredentials): Promise<string | null> {
  const jwt = createSignedJwt(credentials, 'https://www.googleapis.com/auth/indexing')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('⚠️ [GoogleIndexing] Failed to acquire OAuth2 token:', response.status, errorText)
    return null
  }

  const tokenData = await response.json()
  return tokenData.access_token || null
}

/**
 * Submits a URL directly to Google's real-time Indexing API.
 * Google typically dispatches Googlebot to crawl and index the target URL within minutes.
 */
export async function submitToGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<GoogleIndexingResult> {
  const credentials = getGoogleCredentials()
  if (!credentials) {
    return {
      engine: 'Google Indexing API',
      url,
      status: 0,
      ok: false,
      message: 'Not configured (requires GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env)',
    }
  }

  try {
    const token = await getGoogleAccessToken(credentials)
    if (!token) {
      return {
        engine: 'Google Indexing API',
        url,
        status: 401,
        ok: false,
        message: 'Google OAuth2 authentication failed. Verify service account credentials.',
      }
    }

    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    })

    const data = await response.json()
    const ok = response.status >= 200 && response.status < 300

    return {
      engine: 'Google Indexing API',
      url,
      status: response.status,
      ok,
      message: ok
        ? `Successfully notified Googlebot of ${url} (Notify time: ${data?.urlNotificationMetadata?.latestUpdate?.notifyTime || 'instant'})`
        : `Google Indexing API rejected request: ${data?.error?.message || response.statusText}`,
    }
  } catch (err: any) {
    return {
      engine: 'Google Indexing API',
      url,
      status: 0,
      ok: false,
      message: err?.message || 'Network error connecting to Google Indexing API',
    }
  }
}
