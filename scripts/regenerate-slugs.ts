/**
 * Script to regenerate slugs for all existing articles
 * This fixes Hindi articles that have gibberish slugs (-, -102-7-, etc.)
 * 
 * Run with: npx ts-node scripts/regenerate-slugs.ts
 */

import { createClient } from '@supabase/supabase-js'
import { generateSlug } from '../lib/utils'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

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
