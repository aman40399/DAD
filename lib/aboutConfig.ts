import fs from 'fs'
import path from 'path'
import { isD1Configured, queryD1, executeD1 } from './d1'
import { AboutConfig, DEFAULT_ABOUT_CONFIG, EditorialTenet, ColophonItem } from '@/types/about'

export type { AboutConfig, EditorialTenet, ColophonItem }
export { DEFAULT_ABOUT_CONFIG }

const configFilePath = path.join(process.cwd(), 'data', 'aboutConfig.json')

// In-memory cache with timestamp
let cachedConfig: AboutConfig = DEFAULT_ABOUT_CONFIG
let cacheTimestamp = 0
const CACHE_TTL_MS = 15000 // 15 seconds

/**
 * Ensures the site_settings table exists in D1
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
    console.error('[aboutConfig] Error ensuring D1 table:', err)
    return false
  }
}

/**
 * Retrieves the current About page configuration.
 * Prioritizes D1, falls back to data/aboutConfig.json, and lastly defaults.
 */
export async function getAboutConfig(): Promise<AboutConfig> {
  const now = Date.now()
  if (cacheTimestamp > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedConfig
  }

  // 1. Try reading from Cloudflare D1
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
        return resolved
      }
    } catch (err) {
      console.error('[aboutConfig] Failed reading from D1:', err)
    }
  }

  // 2. Try reading from local data/aboutConfig.json
  try {
    if (fs.existsSync(configFilePath)) {
      const raw = fs.readFileSync(configFilePath, 'utf-8')
      const parsed = JSON.parse(raw)
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
      return resolved
    }
  } catch (err) {
    console.error('[aboutConfig] Failed reading local aboutConfig.json:', err)
  }

  cachedConfig = DEFAULT_ABOUT_CONFIG
  cacheTimestamp = now
  return DEFAULT_ABOUT_CONFIG
}

/**
 * Saves updated About page configuration to D1 and local storage.
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

  const jsonStr = JSON.stringify(merged, null, 2)

  // 1. Save to D1
  if (isD1Configured()) {
    try {
      await ensureD1Table()
      await executeD1(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        ['about_page', jsonStr, new Date().toISOString()]
      )
    } catch (err) {
      console.error('[aboutConfig] Failed saving to D1:', err)
    }
  }

  // 2. Save locally if filesystem permits (e.g. local dev)
  try {
    const dataDir = path.dirname(configFilePath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, jsonStr, 'utf-8')
  } catch (err) {
    // Ephemeral fs on serverless is expected
  }

  // Invalidate cache immediately
  cachedConfig = merged
  cacheTimestamp = Date.now()

  return merged
}
