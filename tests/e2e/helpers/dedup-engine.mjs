/**
 * Deduplication and Broadsheet layout curation oracle.
 * Authoritative source: PROJECT.md Features 17, 18, 19
 */

export const BROADSHEET_SECTIONS = {
  SLOT_1_TICKER: 1,
  SLOT_2_LEAD_HERO: 2,
  SLOTS_3_4_LEFT_RAIL: [3, 4],
  SLOTS_5_6_SUB_LEADS: [5, 6],
  SLOTS_7_11_MORE_TO_READ: [7, 8, 9, 10, 11],
  SLOTS_12_15_EDITORS_PICKS: [12, 13, 14, 15]
}

export function simulateBroadsheetCuration(articles, pinnedMap = new Map()) {
  // Only published articles are eligible
  const published = articles.filter(a => a.status === 'published')
  
  // Slots 1 through 15
  const slots = new Array(16).fill(null)
  const usedArticleIds = new Set()

  // 1. Assign pinned slots first
  for (let slot = 1; slot <= 15; slot++) {
    const pinnedId = pinnedMap.get(slot)
    if (pinnedId) {
      const art = published.find(a => a.id === pinnedId)
      if (art && !usedArticleIds.has(art.id)) {
        slots[slot] = art
        usedArticleIds.add(art.id)
      }
    }
  }

  // 2. Also check if articles have homepagePosition directly attached
  for (const art of published) {
    const pos = art.homepagePosition || art.homepage_position
    if (pos >= 1 && pos <= 15 && !slots[pos] && !usedArticleIds.has(art.id)) {
      slots[pos] = art
      usedArticleIds.add(art.id)
    }
  }

  // 3. Backfill remaining empty slots using unassigned published articles
  const availableBackfill = published
    .filter(a => !usedArticleIds.has(a.id))
    .sort((a, b) => new Date(b.published_at || b.publishedAt || 0).getTime() - new Date(a.published_at || a.publishedAt || 0).getTime())

  let backfillIdx = 0
  for (let slot = 1; slot <= 15; slot++) {
    if (!slots[slot] && backfillIdx < availableBackfill.length) {
      slots[slot] = availableBackfill[backfillIdx++]
      usedArticleIds.add(slots[slot].id)
    }
  }

  return { slots, usedArticleIds }
}
