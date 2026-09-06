/**
 * Script to regenerate slugs for all existing articles
 * This fixes Hindi articles that have gibberish slugs (-, -102-7-, etc.)
 * 
 * Run with: node scripts/regenerate-slugs.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Hindi to Latin transliteration function (copied from lib/utils.ts)
function generateSlug(title) {
  // Check if title contains Hindi characters (Devanagari Unicode range: U+0900 to U+097F)
  const hasHindi = /[\u0900-\u097F]/.test(title)
  
  if (hasHindi) {
    // Transliteration map for Hindi to Latin characters
    const hindiToLatin = {
      // Vowels
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
      'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
      // Consonants
      'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
      'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
      'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
      'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
      'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
      'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'ळ': 'l',
      'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
      // Special characters
      'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'झ़': 'zh',
      'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
      // Vowel marks (matras)
      'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
      'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
      // Special marks
      'ं': 'n', 'ः': 'h', '्': '', 'ँ': 'n',
      // Numbers
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
      // Common punctuation
      '।': '', '॥': '',
    }
    
    // Transliterate Hindi characters to Latin
    let transliterated = title
    for (const [hindi, latin] of Object.entries(hindiToLatin)) {
      transliterated = transliterated.replace(new RegExp(hindi, 'g'), latin)
    }
    
    return transliterated
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Remove consecutive hyphens
      .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
      .trim()
  }
  
  // For English or other languages, use standard slugification
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

async function regenerateAllSlugs() {
  console.log('🔄 Starting slug regeneration...\n')

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching articles:', error.message)
    return
  }

  if (!articles || articles.length === 0) {
    console.log('⚠️  No articles found in database')
    return
  }

  console.log(`📚 Found ${articles.length} articles\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const article of articles) {
    const newSlug = generateSlug(article.title)
    
    // Check if slug actually changed
    if (newSlug === article.slug) {
      console.log(`⏭️  SKIP: "${article.title.substring(0, 50)}..." - slug unchanged`)
      skipped++
      continue
    }

    // Update the slug
    const { error: updateError } = await supabase
      .from('articles')
      .update({ slug: newSlug })
      .eq('id', article.id)

    if (updateError) {
      console.error(`❌ FAILED: "${article.title.substring(0, 50)}..." - ${updateError.message}`)
      failed++
    } else {
      console.log(`✅ UPDATED: "${article.title.substring(0, 50)}..."`)
      console.log(`   Old: ${article.slug}`)
      console.log(`   New: ${newSlug}\n`)
      updated++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY:')
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`   📚 Total: ${articles.length}`)
  console.log('='.repeat(60))
}

// Run the script
regenerateAllSlugs()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
