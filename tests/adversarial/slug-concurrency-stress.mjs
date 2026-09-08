/**
 * Adversarial Test Suite 2: High-Concurrency & Collision Resolution Stress Harness
 * Tests lib/utils.ts collision resolution and lib/articles.ts / API endpoints under high concurrency.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateSlug,
  isValidSlug,
  resolveSlugCollision,
  resolveSlugCollisionFromList,
} from '../../lib/utils.ts'
import { isServerAvailable, createContractServer } from '../e2e/fixtures/test-server.mjs'

export async function runSlugConcurrencyStressTests(baseUrl) {
  await describe('Adversarial Suite 2: High-Concurrency & Slug Collision Resolution', async () => {

    // -------------------------------------------------------------
    // 1. Synchronous & Asynchronous Collision Resolution (Unit Stress)
    // -------------------------------------------------------------
    await it('Collision Unit: 100 sequential collisions generate accurate numeric suffixes', () => {
      const base = 'breaking-news'
      const existing = new Set()

      for (let i = 0; i <= 100; i++) {
        const slug = resolveSlugCollisionFromList(base, existing)
        assert.ok(isValidSlug(slug), `Generated slug "${slug}" must be URL-safe`)
        assert.ok(!existing.has(slug), `Slug "${slug}" must not collide with existing`)
        existing.add(slug)

        if (i === 0) {
          assert.equal(slug, 'breaking-news')
        } else {
          assert.equal(slug, `breaking-news-${i}`)
        }
      }
      assert.equal(existing.size, 101)
    })

    await it('Collision Unit: 50 concurrent async resolutions against shared store', async () => {
      const base = 'concurrent-dispatch'
      const store = new Set()

      // Mutex/store check simulation with realistic async latency
      const isTaken = async (candidate) => {
        // Small async yield to simulate I/O or DB query
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 5))
        return store.has(candidate)
      }

      const tasks = Array.from({ length: 50 }, async () => {
        const slug = await resolveSlugCollision(base, isTaken)
        store.add(slug)
        return slug
      })

      const results = await Promise.all(tasks)

      assert.equal(results.length, 50)
      const uniqueSlugs = new Set(results)
      assert.equal(uniqueSlugs.size, 50, `All 50 concurrent slugs must be unique, got ${uniqueSlugs.size}`)

      for (const slug of results) {
        assert.ok(isValidSlug(slug), `Slug "${slug}" must be URL-safe`)
        assert.ok(slug.startsWith('concurrent-dispatch'), `Slug "${slug}" must start with base`)
      }
    })

    await it('Collision Unit: 1,000 collision loop boundary and timestamp fallback', async () => {
      const base = 'heavily-colliding-story'
      const store = new Set([base])

      // Populate collisions 1 through 1000
      for (let i = 1; i <= 1000; i++) {
        store.add(`${base}-${i}`)
      }

      const isTaken = (candidate) => store.has(candidate)

      const start = Date.now()
      const fallbackSlug = await resolveSlugCollision(base, isTaken)
      const elapsed = Date.now() - start

      assert.ok(elapsed < 200, `Collision search must terminate promptly (took ${elapsed}ms)`)
      assert.ok(isValidSlug(fallbackSlug), `Fallback slug "${fallbackSlug}" must be URL-safe`)
      assert.ok(!store.has(fallbackSlug), `Fallback slug must not collide with existing`)
      assert.ok(fallbackSlug.startsWith(`${base}-`), `Fallback slug must start with base`)

      // Also verify sync version
      const syncFallback = resolveSlugCollisionFromList(base, store)
      assert.ok(isValidSlug(syncFallback), `Sync fallback slug "${syncFallback}" must be URL-safe`)
      assert.ok(!store.has(syncFallback), `Sync fallback slug must not collide`)
    })

    await it('Collision Unit: Non-canonical, dirty baseSlug inputs normalized during resolution', async () => {
      const store = new Set(['unclean-title'])
      const isTaken = (s) => store.has(s)

      const slug1 = await resolveSlugCollision('UNCLEAN TITLE', isTaken)
      assert.equal(slug1, 'unclean-title-1')

      const slug2 = await resolveSlugCollision('   unclean_title   ', isTaken)
      assert.equal(slug2, 'unclean-title-1')

      const slug3 = await resolveSlugCollision('$$$ ### ???', isTaken)
      assert.equal(slug3, 'article')
    })

    await it('Collision Unit: Titles with preexisting numeric suffixes do not loop or corrupt', async () => {
      const store = new Set()
      const isTaken = (s) => store.has(s)

      // Title is literally "Apollo 11" -> apollo-11
      const s1 = await resolveSlugCollision('apollo-11', isTaken)
      assert.equal(s1, 'apollo-11')
      store.add(s1)

      const s2 = await resolveSlugCollision('apollo-11', isTaken)
      assert.equal(s2, 'apollo-11-1')
      store.add(s2)

      const s3 = await resolveSlugCollision('apollo-11', isTaken)
      assert.equal(s3, 'apollo-11-2')
      store.add(s3)

      assert.equal(store.size, 3)
    })

    // -------------------------------------------------------------
    // 2. Integration High-Concurrency Stress against live API Server
    // -------------------------------------------------------------
    if (baseUrl) {
      await it('Integration Stress: 50 concurrent duplicate article creations via HTTP POST', async () => {
        const sharedTitle = `Concurrent Broadsheet Alert ${Date.now()}`
        const count = 50

        console.log(`\n  ⚡ Launching ${count} simultaneous POST /api/articles requests for: "${sharedTitle}"...`)

        const requests = Array.from({ length: count }, async (_, i) => {
          const res = await fetch(`${baseUrl}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: sharedTitle,
              subtitle: `Concurrent test payload ${i}`,
              content: `<p>Concurrent article test body content index ${i}</p>`,
              excerpt: `Excerpt for concurrent test article ${i}`,
              author: `Concurrent Tester ${i}`,
              category: 'Business',
              status: 'draft',
              tags: ['concurrency', 'adversarial', 'stress'],
            }),
          })
          const body = await res.json()
          return { status: res.status, body }
        })

        const responses = await Promise.all(requests)

        // Check HTTP statuses
        const successful = responses.filter((r) => r.status === 201)
        assert.equal(
          successful.length,
          count,
          `Expected all ${count} concurrent requests to return HTTP 201, got ${successful.length} (failed: ${count - successful.length})`
        )

        // Collect all slugs
        const slugs = responses.map((r) => r.body.article?.slug || r.body.slug)
        assert.equal(slugs.length, count, `Must have ${count} slugs`)

        // Verify uniqueness
        const uniqueSet = new Set(slugs)
        assert.equal(
          uniqueSet.size,
          count,
          `Every concurrent article must have a unique slug! Collisions detected: ${count - uniqueSet.size} duplicates.`
        )

        // Verify all slugs are strictly valid URL-safe ASCII
        for (const slug of slugs) {
          assert.ok(isValidSlug(slug), `Generated slug "${slug}" must be strictly URL-safe ASCII`)
        }

        console.log(`  ✅ Successfully created ${count} unique articles concurrently with zero collisions!`)
        console.log(`     Sample slugs: ${slugs.slice(0, 3).join(', ')} ... ${slugs[slugs.length - 1]}`)
      })

      await it('Integration Stress: 30 concurrent duplicate Hindi article creations via HTTP POST', async () => {
        const sharedHindiTitle = `भारत में आधुनिक सेमीकंडक्टर क्रांति ${Date.now()}`
        const count = 30

        console.log(`\n  ⚡ Launching ${count} simultaneous Hindi POST /api/articles requests...`)

        const requests = Array.from({ length: count }, async (_, i) => {
          const res = await fetch(`${baseUrl}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: sharedHindiTitle,
              content: `<p>सेमीकंडक्टर निर्माण में भारत की ऐतिहासिक प्रगति ${i}</p>`,
              excerpt: `सेमीकंडक्टर नीति २०२६ ${i}`,
              author: 'वरिष्ठ संपादक',
              category: 'Technology',
              status: 'draft',
              language: 'hindi',
            }),
          })
          const body = await res.json()
          return { status: res.status, body }
        })

        const responses = await Promise.all(requests)

        const successful = responses.filter((r) => r.status === 201)
        assert.equal(successful.length, count, `All ${count} Hindi articles should return 201`)

        const slugs = responses.map((r) => r.body.article?.slug || r.body.slug)
        const uniqueSet = new Set(slugs)
        assert.equal(
          uniqueSet.size,
          count,
          `All ${count} concurrent Hindi articles must have unique slugs! Got ${uniqueSet.size}`
        )

        for (const slug of slugs) {
          assert.ok(isValidSlug(slug), `Hindi slug "${slug}" must be valid URL-safe ASCII`)
          assert.ok(!/[\u0900-\u097F]/.test(slug), `Hindi slug "${slug}" must contain zero Devanagari`)
          assert.ok(slug.includes('bhaarat-men'), `Hindi slug should contain transliterated prefix`)
        }

        console.log(`  ✅ Successfully created ${count} unique transliterated Hindi articles concurrently!`)
      })

      await it('Integration: Concurrent slug update does not create duplicate slugs', async () => {
        // Create article 1
        const res1 = await fetch(`${baseUrl}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Unique Base Target ${Date.now()}`,
            content: 'Content 1',
            category: 'General',
            author: 'Tester 1',
            status: 'draft',
          }),
        })
        const art1 = (await res1.json()).article

        // Create article 2
        const res2 = await fetch(`${baseUrl}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Unique Secondary Target ${Date.now()}`,
            content: 'Content 2',
            category: 'General',
            author: 'Tester 2',
            status: 'draft',
          }),
        })
        const art2 = (await res2.json()).article

        // Attempt to update article 2's slug to article 1's slug
        const updateRes = await fetch(`${baseUrl}/api/articles/${art2.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: art1.slug,
          }),
        })
        assert.equal(updateRes.status, 200)
        const updatedArt2 = (await updateRes.json()).article

        // Must NOT match art1.slug (must be collision-resolved)
        assert.notEqual(updatedArt2.slug, art1.slug, 'Updated slug must not collide with art1')
        assert.ok(isValidSlug(updatedArt2.slug), 'Updated slug must remain URL-safe')
        assert.ok(updatedArt2.slug.startsWith(art1.slug), 'Updated slug should have collision suffix')
      })
    }

  })
}

// Standalone execution support
if (process.argv[1]?.endsWith('slug-concurrency-stress.mjs')) {
  const urlArg = process.argv.slice(2).find((a) => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000'
  isServerAvailable(urlArg).then((avail) => {
    const url = avail ? urlArg : null
    if (!url) console.log('⚠️  No active HTTP server detected; running Unit Concurrency tests only.')
    runSlugConcurrencyStressTests(url)
  })
}
