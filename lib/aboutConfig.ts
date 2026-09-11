import { isD1Configured, queryD1, executeD1 } from './d1'
import { AboutConfig, DEFAULT_ABOUT_CONFIG, EditorialTenet, ColophonItem } from '@/types/about'
import { cloudGet, cloudPut, CLOUD_KEYS } from './backend/cloudStore'

export type { AboutConfig, EditorialTenet, ColophonItem }
export { DEFAULT_ABOUT_CONFIG }

// In-memory cache with timestamp
let cachedConfig: AboutConfig = DEFAULT_ABOUT_CONFIG
let cacheTimestamp = 0
const CACHE_TTL_MS = 15000 // 15 seconds

/**
 * Ensures the site_settings table exists in D1 (if D1 is configured)
 */
async function ensureD1Table(): Promise<boolean> {
  if (!isD1Configured()) return false
  try {
    await executeD1(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)
    return true
  } catch (err) {
    return false
  }
}

/**
 * Retrieves the current About page configuration.
 * Prioritizes permanent Cloud Storage (R2), with D1 support and fallback to defaults.
 */
export async function getAboutConfig(): Promise<AboutConfig> {
  const now = Date.now()
  if (cacheTimestamp > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig
  }

  // 1. Fetch from Permanent Cloud Storage (R2)
  try {
    const cloudData = await cloudGet<AboutConfig>(CLOUD_KEYS.ABOUT_CONFIG)
    if (cloudData) {
      const resolved: AboutConfig = {
        ...DEFAULT_ABOUT_CONFIG,
        ...cloudData,
        mobileVariant: {
          ...DEFAULT_ABOUT_CONFIG.mobileVariant,
          ...(cloudData.mobileVariant || {}),
        },
      }
      cachedConfig = resolved
      cacheTimestamp = now
      return resolved
    }
  } catch (err) {
    console.error('[aboutConfig] Error reading from cloud store:', err)
  }

  // 2. Try reading from Cloudflare D1 if available
  if (isD1Configured()) {
    try {
      await ensureD1Table()
      const rows = await queryD1<{ key: string; value: string }>(
        'SELECT value FROM site_settings WHERE key = ? LIMIT 1',
        ['about_page']
      )
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value)
        const resolved: AboutConfig = {
          ...DEFAULT_ABOUT_CONFIG,
          ...parsed,
          mobileVariant: {
            ...DEFAULT_ABOUT_CONFIG.mobileVariant,
            ...(parsed.mobileVariant || {}),
          },
        }
        cachedConfig = resolved
        cacheTimestamp = now
        // Sync to cloud storage
        await cloudPut(CLOUD_KEYS.ABOUT_CONFIG, resolved)
        return resolved
      }
    } catch (err) {
      // D1 unavailable
    }
  }

  // 3. Fallback to default config and seed to cloud store
  cachedConfig = DEFAULT_ABOUT_CONFIG
  cacheTimestamp = now
  await cloudPut(CLOUD_KEYS.ABOUT_CONFIG, DEFAULT_ABOUT_CONFIG)
  return DEFAULT_ABOUT_CONFIG
}

/**
 * Saves updated About page configuration permanently to Cloud Storage (R2) and D1.
 */
export async function saveAboutConfig(updated: Partial<AboutConfig>): Promise<AboutConfig> {
  const current = await getAboutConfig()
  const merged: AboutConfig = {
    ...current,
    ...updated,
    mobileVariant: {
      ...current.mobileVariant,
      ...(updated.mobileVariant || {}),
    },
  }

  // 1. Save permanently to Cloud Storage (R2)
  await cloudPut(CLOUD_KEYS.ABOUT_CONFIG, merged)

  // 2. Also mirror to D1 if configured
  if (isD1Configured()) {
    try {
      await ensureD1Table()
      await executeD1(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        ['about_page', JSON.stringify(merged), new Date().toISOString()]
      )
    } catch (err) {
      // Non-fatal
    }
  }

  // Invalidate memory cache immediately
  cachedConfig = merged
  cacheTimestamp = Date.now()

  return merged
}
