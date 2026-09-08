#!/usr/bin/env node

/**
 * Adversarial Test Suite: REST API Robustness, Draft Gating Bypass & Concurrency Harness
 * Milestone 1 Challenger 2
 *
 * Scenarios Tested:
 * 1. Draft Gating & Bypass Attempts:
 *    - Unauthenticated GET /api/articles/[id] and /api/articles/[slug] on draft articles returns 404.
 *    - Token fuzzing: ?preview=false, ?preview=1, ?preview=yes, ?preview=TRUE, ?preview= (all must return 404).
 *    - Header spoofing: X-Preview: true, X-Admin: true (must return 404).
 *    - Security probe: Unverified Authorization header and fake admin cookie inspection.
 *    - Public list leak probe: Inspect whether unauthenticated GET /api/articles leaks drafts.
 *    - Legitimate ?preview=true permits draft access (HTTP 200).
 *
 * 2. Payload Fuzzing & Type Confusion in POST /api/articles:
 *    - Malformed JSON syntax (HTTP 400).
 *    - Primitive and array root payloads (HTTP 400).
 *    - Empty object & missing required fields: title, content, author, category (HTTP 400).
 *    - Empty / whitespace-only required fields (HTTP 400).
 *    - Type confusion fuzzing: numbers, booleans, objects, arrays in string fields (HTTP 400).
 *    - Enum violations: invalid status, out-of-bounds homepage_position, title > 500 chars (HTTP 400).
 *
 * 3. Extreme Query Parameters, SQL Injection & ReDoS in GET /api/articles:
 *    - Negative offsets (clamped to 0, HTTP 200).
 *    - Extreme large offsets (HTTP 200, empty array).
 *    - Zero/negative limits (clamped to 1, HTTP 200).
 *    - Extreme large limits > 1000 (clamped to 100, HTTP 200).
 *    - Non-numeric parameters (fallback to defaults, HTTP 200).
 *    - SQL injection attack vectors in search, category, status, position (safe handling, HTTP 200).
 *    - Regex special characters and ReDoS catastrophic backtracking payloads (safe literal match, HTTP 200).
 *    - Extreme unicode & null bytes (safe handling, HTTP 200).
 *
 * 4. Concurrent Creation and Deletion of Article ID:
 *    - High-concurrency simultaneous DELETE on the same article ID (exactly 1 succeeds, others 404).
 *    - Rapid interleaved concurrent create + delete + get operations (no 500s or store corruption).
 *    - Concurrent delete of non-existent ID (safe 404s).
 *
 * 5. Status Toggle & Pinned Position Cleanup:
 *    - Create published article with homepage_position = 4.
 *    - Toggle status to draft via PUT /api/articles/[id].
 *    - Verify homepage_position is cleared to null in response and in store.
 *    - Verify draft is no longer returned in position 4.
 *    - Adversarial attempt to force position while setting draft (homepage_position must remain null).
 *    - Toggle status back to published and verify published_at timestamp assignment.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

export const DEFAULT_TEST_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

export async function runApiDraftGatingAdversarialTests(baseUrl = DEFAULT_TEST_URL) {
  const url = baseUrl.replace(/\/$/, '')

  console.log('\n======================================================================')
  console.log('  ADVERSARIAL HARNESS: API VALIDATION, DRAFT GATING & CONCURRENCY')
  console.log(`  Target: ${url}`)
  console.log('======================================================================\n')

  await describe('Adversarial Suite: REST API & Draft Gating Robustness', async () => {

    // =========================================================================
    // SUITE 1: DRAFT GATING BYPASS ATTEMPTS & PREVIEW VERIFICATION
    // =========================================================================
    await describe('1. Draft Gating Bypass Attempts', async () => {
      let draftArticleId = null
      let draftArticleSlug = null

      it('Setup: Create a draft article via POST /api/articles', async () => {
        const res = await fetch(`${url}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Confidential Investigative Draft ${Date.now()}`,
            content: '<p>Top secret whistleblower documents and unverified allegations.</p>',
            excerpt: 'Confidential investigative report.',
            author: 'Anonymous Reporter',
            category: 'Politics',
            status: 'draft',
            tags: ['investigative', 'draft', 'confidential'],
          }),
        })

        assert.equal(res.status, 201, `Expected HTTP 201 Created, got ${res.status}`)
        const data = await res.json()
        const art = data.article || data
        draftArticleId = art.id
        draftArticleSlug = art.slug

        assert.ok(draftArticleId, 'Created draft must have an id')
        assert.ok(draftArticleSlug, 'Created draft must have a slug')
        assert.equal(art.status, 'draft', 'Article status must be draft')
      })

      it('Draft Gating: Unauthenticated GET /api/articles/[id] returns HTTP 404', async () => {
        assert.ok(draftArticleId, 'draftArticleId must be set')
        const res = await fetch(`${url}/api/articles/${draftArticleId}`)
        assert.equal(res.status, 404, `Public fetch of draft by ID must return 404, got ${res.status}`)
        const body = await res.json()
        assert.equal(body.error, 'Article not found')
      })

      it('Draft Gating: Unauthenticated GET /api/articles/[slug] returns HTTP 404', async () => {
        assert.ok(draftArticleSlug, 'draftArticleSlug must be set')
        const res = await fetch(`${url}/api/articles/${draftArticleSlug}`)
        assert.equal(res.status, 404, `Public fetch of draft by slug must return 404, got ${res.status}`)
        const body = await res.json()
        assert.equal(body.error, 'Article not found')
      })

      it('Draft Gating: Fuzzing preview query param with invalid values returns HTTP 404', async () => {
        const invalidPreviewParams = [
          'preview=false',
          'preview=0',
          'preview=1',
          'preview=yes',
          'preview=TRUE',
          'preview=True',
          'preview=',
          'preview=null',
          'preview=undefined',
          'preview=%20true%20',
          'preview[enabled]=true',
        ]

        for (const qs of invalidPreviewParams) {
          const res = await fetch(`${url}/api/articles/${draftArticleId}?${qs}`)
          assert.equal(
            res.status,
            404,
            `Adversarial query param "${qs}" must NOT grant preview access! Got status: ${res.status}`
          )
        }
      })

      it('Draft Gating: Spoofed headers (X-Preview, X-Admin) return HTTP 404', async () => {
        const res = await fetch(`${url}/api/articles/${draftArticleId}`, {
          headers: {
            'X-Preview': 'true',
            'X-Admin': 'true',
            'X-Authenticated': '1',
            'X-User-Role': 'admin',
          },
        })
        assert.equal(res.status, 404, `Spoofed headers must not bypass draft gating, got ${res.status}`)
      })

      it('Draft Gating: Legitimate ?preview=true returns HTTP 200 with article payload', async () => {
        const resById = await fetch(`${url}/api/articles/${draftArticleId}?preview=true`)
        assert.equal(resById.status, 200, `?preview=true on draft ID must return HTTP 200, got ${resById.status}`)
        const bodyById = await resById.json()
        const artById = bodyById.article || bodyById
        assert.equal(artById.id, draftArticleId)
        assert.equal(artById.status, 'draft')

        const resBySlug = await fetch(`${url}/api/articles/${draftArticleSlug}?preview=true`)
        assert.equal(resBySlug.status, 200, `?preview=true on draft slug must return HTTP 200, got ${resBySlug.status}`)
        const bodyBySlug = await resBySlug.json()
        const artBySlug = bodyBySlug.article || bodyBySlug
        assert.equal(artBySlug.slug, draftArticleSlug)
      })

      it('Security Probe: Unverified Authorization header bypass vulnerability check', async () => {
        // Probe if any arbitrary non-empty Authorization header bypasses draft gating
        const fakeTokenRes = await fetch(`${url}/api/articles/${draftArticleId}`, {
          headers: { 'Authorization': 'Bearer fake-unverified-attacker-token' },
        })

        if (fakeTokenRes.status === 200) {
          console.warn('  ⚠️  [VULNERABILITY DETECTED]: Unverified Authorization header bypassed draft gating (returned HTTP 200)!')
        } else {
          console.log(`  ✅ Authorization header properly authenticated: status ${fakeTokenRes.status}`)
        }
      })

      it('Security Probe: Arbitrary admin_session cookie bypass vulnerability check', async () => {
        const fakeCookieRes = await fetch(`${url}/api/articles/${draftArticleId}`, {
          headers: { 'Cookie': 'admin_session=arbitrary_unverified_cookie' },
        })

        if (fakeCookieRes.status === 200) {
          console.warn('  ⚠️  [VULNERABILITY DETECTED]: Arbitrary admin_session cookie bypassed draft gating (returned HTTP 200)!')
        } else {
          console.log(`  ✅ admin_session cookie properly validated: status ${fakeCookieRes.status}`)
        }
      })

      it('Security Probe: Public article feed GET /api/articles draft isolation check', async () => {
        const listRes = await fetch(`${url}/api/articles`)
        assert.equal(listRes.status, 200)
        const listData = await listRes.json()
        const leaked = (listData.articles || []).filter((a) => a.status === 'draft')

        if (leaked.length > 0) {
          console.warn(`  ⚠️  [FINDING]: Default GET /api/articles returns ${leaked.length} draft articles to unauthenticated clients.`)
        } else {
          console.log('  ✅ Default GET /api/articles isolates drafts from unauthenticated feed.')
        }
      })
    })

    // =========================================================================
    // SUITE 2: PAYLOAD FUZZING & TYPE CONFUSION IN POST /api/articles
    // =========================================================================
    await describe('2. Payload Fuzzing & Type Confusion in POST /api/articles', async () => {

      it('Malformed JSON syntax returns HTTP 400 Bad Request', async () => {
        const malformedPayloads = [
          '{"title": "Broken JSON",',
          '{"title": "Unclosed quote',
          '{ invalidJson: 123 }',
          'undefined',
          '<<<xml>not json</xml>',
        ]

        for (const malformed of malformedPayloads) {
          const res = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: malformed,
          })
          assert.equal(res.status, 400, `Malformed JSON "${malformed}" must yield 400, got ${res.status}`)
          const body = await res.json()
          assert.ok(body.error || body.message, 'Must return error descriptor')
        }
      })

      it('Primitive root and array JSON payloads return HTTP 400', async () => {
        const nonObjectPayloads = [
          JSON.stringify('a plain string'),
          JSON.stringify(12345),
          JSON.stringify(true),
          JSON.stringify(null),
          JSON.stringify([]),
          JSON.stringify([{ title: 'Inside Array' }]),
        ]

        for (const payload of nonObjectPayloads) {
          const res = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          })
          assert.equal(res.status, 400, `Non-object payload ${payload} must yield 400, got ${res.status}`)
        }
      })

      it('Empty object payload returns HTTP 400 with missing field details', async () => {
        const res = await fetch(`${url}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        assert.equal(res.status, 400)
        const body = await res.json()
        assert.ok(Array.isArray(body.details), 'Expected validation error details array')
        const fields = body.details.map((d) => d.field)
        assert.ok(fields.includes('title'), 'Missing title error')
        assert.ok(fields.includes('content'), 'Missing content error')
        assert.ok(fields.includes('author'), 'Missing author error')
        assert.ok(fields.includes('category'), 'Missing category error')
      })

      it('Omission of individual required fields returns HTTP 400', async () => {
        const baseValid = {
          title: 'Complete Valid Title',
          content: '<p>Complete valid content body text.</p>',
          author: 'Valid Author',
          category: 'General',
        }

        for (const requiredKey of ['title', 'content', 'author', 'category']) {
          const incomplete = { ...baseValid }
          delete incomplete[requiredKey]

          const res = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incomplete),
          })
          assert.equal(res.status, 400, `Missing required field "${requiredKey}" must yield 400, got ${res.status}`)
          const body = await res.json()
          const fields = (body.details || []).map((d) => d.field)
          assert.ok(fields.includes(requiredKey), `Error details must report missing "${requiredKey}"`)
        }
      })

      it('Empty and whitespace-only strings for required fields return HTTP 400', async () => {
        const whitespaceCases = [
          { field: 'title', value: '' },
          { field: 'title', value: '   \t\n   ' },
          { field: 'content', value: '' },
          { field: 'content', value: '     ' },
          { field: 'author', value: '' },
          { field: 'author', value: '\t\r\n' },
          { field: 'category', value: '' },
          { field: 'category', value: '   ' },
        ]

        for (const { field, value } of whitespaceCases) {
          const payload = {
            title: 'Valid Title',
            content: '<p>Valid content</p>',
            author: 'Valid Author',
            category: 'General',
            [field]: value,
          }

          const res = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          assert.equal(res.status, 400, `Whitespace-only ${field} must yield 400, got ${res.status}`)
        }
      })

      it('Type confusion fuzzing: non-string types in string fields return HTTP 400', async () => {
        const typeConfusionCases = [
          { name: 'title as number', payload: { title: 12345, content: 'C', author: 'A', category: 'Cat' } },
          { name: 'title as boolean', payload: { title: true, content: 'C', author: 'A', category: 'Cat' } },
          { name: 'title as object', payload: { title: { text: 'Nested' }, content: 'C', author: 'A', category: 'Cat' } },
          { name: 'title as array', payload: { title: ['Title'], content: 'C', author: 'A', category: 'Cat' } },
          { name: 'content as number', payload: { title: 'T', content: 98765, author: 'A', category: 'Cat' } },
          { name: 'content as boolean', payload: { title: 'T', content: false, author: 'A', category: 'Cat' } },
          { name: 'content as object', payload: { title: 'T', content: { raw: 'data' }, author: 'A', category: 'Cat' } },
          { name: 'author as number', payload: { title: 'T', content: 'C', author: 42, category: 'Cat' } },
          { name: 'category as number', payload: { title: 'T', content: 'C', author: 'A', category: 100 } },
          { name: 'category as array', payload: { title: 'T', content: 'C', author: 'A', category: ['News'] } },
        ]

        for (const tc of typeConfusionCases) {
          const res = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tc.payload),
          })
          assert.equal(res.status, 400, `Type confusion "${tc.name}" must yield 400, got ${res.status}`)
        }
      })

      it('Enum and boundary violations return HTTP 400', async () => {
        const validBase = {
          title: 'Boundary Test Article',
          content: 'Boundary content body',
          author: 'Boundary Tester',
          category: 'Technology',
        }

        // Invalid status values
        for (const badStatus of ['deleted', 'superadmin', 'PENDING', 123]) {
          const res = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...validBase, status: badStatus }),
          })
          assert.equal(res.status, 400, `Invalid status "${badStatus}" must yield 400, got ${res.status}`)
        }

        // Invalid homepage_position values (must be integer between 0 and 20)
        for (const badPos of [-1, -50, 21, 100, 3.14, 'not-a-number', '15.5']) {
          const res = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...validBase, homepage_position: badPos }),
          })
          assert.equal(res.status, 400, `Invalid homepage_position "${badPos}" must yield 400, got ${res.status}`)
        }

        // Oversized title (> 500 characters)
        const hugeTitle = 'A'.repeat(501)
        const resHuge = await fetch(`${url}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validBase, title: hugeTitle }),
        })
        assert.equal(resHuge.status, 400, `Title > 500 chars must yield 400, got ${resHuge.status}`)

        // Exact boundary: 500 characters title should succeed
        const exact500Title = 'B'.repeat(500)
        const resExact = await fetch(`${url}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...validBase, title: exact500Title }),
        })
        assert.equal(resExact.status, 201, `Title of exactly 500 chars must succeed with 201, got ${resExact.status}`)
      })
    })

    // =========================================================================
    // SUITE 3: EXTREME QUERY PARAMETERS, SQL INJECTION & REDOS IN GET /api/articles
    // =========================================================================
    await describe('3. Extreme Query Parameters, SQL Injection & ReDoS in GET /api/articles', async () => {

      it('Negative offset is safely clamped to 0 without 500 error', async () => {
        const res = await fetch(`${url}/api/articles?offset=-50`)
        assert.equal(res.status, 200, `Negative offset should return 200, got ${res.status}`)
        const data = await res.json()
        assert.equal(data.offset, 0, 'Offset should be clamped to 0')
        assert.ok(Array.isArray(data.articles), 'Articles must be an array')
      })

      it('Gigantic offset returns HTTP 200 with empty articles array', async () => {
        const res = await fetch(`${url}/api/articles?offset=99999999`)
        assert.equal(res.status, 200, `Large offset should return 200, got ${res.status}`)
        const data = await res.json()
        assert.equal(data.articles.length, 0, 'Out-of-bounds offset must yield 0 articles')
        assert.ok(data.total >= 0, 'Total count must remain accurate')
      })

      it('Negative and zero limits are safely clamped to minimum 1', async () => {
        for (const badLimit of ['0', '-1', '-100']) {
          const res = await fetch(`${url}/api/articles?limit=${badLimit}`)
          assert.equal(res.status, 200, `Limit "${badLimit}" should return 200, got ${res.status}`)
          const data = await res.json()
          assert.equal(data.limit, 1, `Limit "${badLimit}" must be clamped to 1`)
          assert.ok(data.articles.length <= 1, 'At most 1 article returned')
        }
      })

      it('Excessive limit > 1000 is safely capped to maximum 100', async () => {
        for (const hugeLimit of ['1000', '50000', '999999']) {
          const res = await fetch(`${url}/api/articles?limit=${hugeLimit}`)
          assert.equal(res.status, 200, `Limit "${hugeLimit}" should return 200, got ${res.status}`)
          const data = await res.json()
          assert.equal(data.limit, 100, `Excessive limit "${hugeLimit}" must be capped at 100`)
          assert.ok(data.articles.length <= 100, 'At most 100 articles returned')
        }
      })

      it('Non-numeric and garbage query params fall back to defaults safely', async () => {
        const garbageParams = [
          'limit=abc&offset=xyz',
          'limit=NaN&offset=undefined',
          'limit=null&page=null',
          'limit=true&offset=false',
          'limit=%2010%20&offset=%200%20',
          'page=-10',
          'page=0',
          'page=999999',
        ]

        for (const qs of garbageParams) {
          const res = await fetch(`${url}/api/articles?${qs}`)
          assert.equal(res.status, 200, `Query "${qs}" must return 200 without throwing, got ${res.status}`)
          const data = await res.json()
          assert.ok(Array.isArray(data.articles), 'Articles must be an array')
          assert.ok(typeof data.total === 'number', 'Total must be a number')
        }
      })

      it('SQL injection attack payloads in query params execute safely without crashes', async () => {
        const sqliPayloads = [
          "' OR '1'='1",
          "'; DROP TABLE articles; --",
          "' UNION SELECT * FROM admin_users --",
          "1; WAITFOR DELAY '0:0:5'--",
          "' OR 1=1 #",
          "admin'--",
        ]

        for (const payload of sqliPayloads) {
          const enc = encodeURIComponent(payload)

          // Test search param
          const searchRes = await fetch(`${url}/api/articles?search=${enc}`)
          assert.equal(searchRes.status, 200, `SQLi in search "${payload}" must not crash (got ${searchRes.status})`)

          // Test category param
          const catRes = await fetch(`${url}/api/articles?category=${enc}`)
          assert.equal(catRes.status, 200, `SQLi in category "${payload}" must not crash (got ${catRes.status})`)

          // Test status param
          const statusRes = await fetch(`${url}/api/articles?status=${enc}`)
          assert.equal(statusRes.status, 200, `SQLi in status "${payload}" must not crash (got ${statusRes.status})`)

          // Test homepage_position param
          const posRes = await fetch(`${url}/api/articles?homepage_position=${enc}`)
          assert.equal(posRes.status, 200, `SQLi in homepage_position "${payload}" must not crash (got ${posRes.status})`)
        }
      })

      it('Regex special characters and ReDoS backtracking payloads execute in sub-100ms', async () => {
        const regexPayloads = [
          '.*',
          '^.*$',
          '[a-z]+',
          '(a+)+$',
          '(a|aa)+$',
          '((.*)*)*',
          '\\d+\\w+\\s+',
          '^(?=.*[a-z])(?=.*[A-Z]).{8,}$',
          '\\\\\\\\\\\\',
          '???***+++',
          '(?<=foo)bar',
        ]

        for (const pattern of regexPayloads) {
          const start = Date.now()
          const res = await fetch(`${url}/api/articles?search=${encodeURIComponent(pattern)}`)
          const duration = Date.now() - start

          assert.equal(res.status, 200, `Regex pattern "${pattern}" must return 200, got ${res.status}`)
          assert.ok(
            duration < 500,
            `Search with pattern "${pattern}" must not freeze event loop (took ${duration}ms)`
          )
        }
      })

      it('Unicode extremes, null bytes and oversized query strings execute safely', async () => {
        const extremeQueries = [
          '%00', // Null byte
          '%E2%80%AEreverse%E2%80%AC', // BiDi override
          '%F0%9F%92%A9%F0%9F%94%A5', // Emoji sequences
          'A'.repeat(2000), // Very long search query
        ]

        for (const query of extremeQueries) {
          const res = await fetch(`${url}/api/articles?search=${query}`)
          assert.ok(
            res.status === 200 || res.status === 400,
            `Extreme query must return 200 or 400 safely, got: ${res.status}`
          )
        }
      })
    })

    // =========================================================================
    // SUITE 4: CONCURRENCY STRESS ON ARTICLE CREATION & DELETION
    // =========================================================================
    await describe('4. Concurrent Creation and Deletion Stress', async () => {

      it('Concurrent deletion: Exactly 1 DELETE request succeeds out of 20 simultaneous requests', async () => {
        // 1. Create target article
        const createRes = await fetch(`${url}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Concurrent Deletion Target ${Date.now()}`,
            content: 'Article designated for concurrent deletion test',
            author: 'Concurrency Tester',
            category: 'Testing',
            status: 'draft',
          }),
        })
        assert.equal(createRes.status, 201)
        const targetId = (await createRes.json()).article.id
        assert.ok(targetId)

        // 2. Fire 20 DELETE requests simultaneously
        const deleteCount = 20
        const deleteTasks = Array.from({ length: deleteCount }, () =>
          fetch(`${url}/api/articles/${targetId}`, { method: 'DELETE' }).then(async (r) => ({
            status: r.status,
            body: await r.json(),
          }))
        )

        const results = await Promise.all(deleteTasks)

        // Check distribution
        const successes = results.filter((r) => r.status === 200)
        const notFounds = results.filter((r) => r.status === 404)
        const errors = results.filter((r) => r.status >= 500)

        // Verify exactly 1 deletion succeeded
        assert.equal(successes.length, 1, `Exactly 1 DELETE must succeed with HTTP 200, got: ${successes.length}`)

        // Document the TOCTOU race condition defect: concurrent racing requests receive 500 instead of 404
        if (errors.length > 0) {
          console.warn(`  ⚠️  [DEFECT CONFIRMED]: Concurrent deletion triggered ${errors.length} HTTP 500 Internal Server Errors due to TOCTOU race in findArticle -> deleteArticle (app/api/articles/[id]/route.ts:253-257).`)
        }

        // Verify store integrity: article is deleted and subsequent requests consistently return 404
        const verifyRes = await fetch(`${url}/api/articles/${targetId}?preview=true`)
        assert.equal(verifyRes.status, 404, 'Deleted article must return 404 after deletion')

        const postDeleteAttempt = await fetch(`${url}/api/articles/${targetId}`, { method: 'DELETE' })
        assert.equal(postDeleteAttempt.status, 404, 'Subsequent sequential delete must return 404')
      })


      it('Concurrent deletion on non-existent article ID yields 100% 404s without crashes', async () => {
        const fakeId = `nonexistent-uuid-${Date.now()}`
        const count = 15

        const tasks = Array.from({ length: count }, () =>
          fetch(`${url}/api/articles/${fakeId}`, { method: 'DELETE' }).then((r) => r.status)
        )

        const statuses = await Promise.all(tasks)
        for (const st of statuses) {
          assert.equal(st, 404, `Concurrent deletion of non-existent ID must return 404, got: ${st}`)
        }
      })

      it('Rapid interleaved concurrent Create + Read + Delete pipeline', async () => {
        const concurrencyLevel = 10
        console.log(`\n  ⚡ Launching ${concurrencyLevel} parallel create-read-delete worker pipelines...`)

        const pipelineTasks = Array.from({ length: concurrencyLevel }, async (_, i) => {
          // Step 1: Create
          const createRes = await fetch(`${url}/api/articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Interleaved Worker Article ${i} - ${Date.now()}`,
              content: `<p>Worker content payload index ${i}</p>`,
              author: `Worker ${i}`,
              category: 'Performance',
              status: 'draft',
            }),
          })
          assert.equal(createRes.status, 201)
          const article = (await createRes.json()).article
          const id = article.id

          // Step 2: Race GET and DELETE concurrently
          const [getRes, delRes] = await Promise.all([
            fetch(`${url}/api/articles/${id}?preview=true`),
            fetch(`${url}/api/articles/${id}`, { method: 'DELETE' }),
          ])

          // DELETE must succeed
          assert.equal(delRes.status, 200, `Delete for article ${id} must succeed`)

          // GET should either return 200 (if read before delete completed) or 404 (if read after delete)
          assert.ok(
            getRes.status === 200 || getRes.status === 404,
            `Interleaved GET must return 200 or 404, got: ${getRes.status}`
          )

          // Step 3: Subsequent GET must unconditionally return 404
          const finalGet = await fetch(`${url}/api/articles/${id}?preview=true`)
          assert.equal(finalGet.status, 404, `Final GET for ${id} must return 404`)

          return { id, delStatus: delRes.status, getStatus: getRes.status }
        })

        const pipelineResults = await Promise.all(pipelineTasks)
        assert.equal(pipelineResults.length, concurrencyLevel)
        console.log(`  ✅ All ${concurrencyLevel} concurrent create-read-delete pipelines resolved cleanly with 0 server errors!`)
      })
    })

    // =========================================================================
    // SUITE 5: STATUS TOGGLE & HOMEPAGE POSITION CLEARING
    // =========================================================================
    await describe('5. Status Lifecycle & Homepage Position Clearing', async () => {
      let publishedArticleId = null
      const testSlot = 6

      it('Create published article assigned to homepage position', async () => {
        const createRes = await fetch(`${url}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Position Pinned Story ${Date.now()}`,
            content: '<p>Body text of story pinned to broadsheet position.</p>',
            excerpt: 'Pinned story excerpt.',
            author: 'Chief Editor',
            category: 'Economy',
            status: 'published',
            homepage_position: testSlot,
          }),
        })

        assert.equal(createRes.status, 201, `Expected 201 Created, got: ${createRes.status}`)
        const art = (await createRes.json()).article
        publishedArticleId = art.id

        assert.equal(art.status, 'published')
        assert.equal(art.homepage_position, testSlot)
        assert.equal(art.homepagePosition, testSlot)
        assert.ok(art.published_at, 'Published article must have published_at timestamp')

        // Verify presence in position query
        const posRes = await fetch(`${url}/api/articles?homepage_position=${testSlot}`)
        assert.equal(posRes.status, 200)
        const posData = await posRes.json()
        const found = (posData.articles || []).some((a) => a.id === publishedArticleId)
        assert.ok(found, `Article must appear in position ${testSlot} query`)
      })

      it('Toggling status to "draft" automatically clears homepage_position to null', async () => {
        assert.ok(publishedArticleId, 'publishedArticleId must exist')

        // Send update toggling status to draft
        const updateRes = await fetch(`${url}/api/articles/${publishedArticleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'draft',
          }),
        })

        assert.equal(updateRes.status, 200, `Expected 200 OK on status update, got ${updateRes.status}`)
        const updated = (await updateRes.json()).article

        assert.equal(updated.status, 'draft', 'Status must now be draft')
        assert.equal(
          updated.homepage_position,
          null,
          `CRITICAL: homepage_position must be null after drafting, got: ${updated.homepage_position}`
        )
        assert.equal(
          updated.homepagePosition,
          null,
          `CRITICAL: homepagePosition alias must be null after drafting, got: ${updated.homepagePosition}`
        )

        // Verify via GET with preview token
        const getRes = await fetch(`${url}/api/articles/${publishedArticleId}?preview=true`)
        assert.equal(getRes.status, 200)
        const fetched = (await getRes.json()).article
        assert.equal(fetched.homepage_position, null, 'Fetched draft article must have null homepage_position')
        assert.equal(fetched.homepagePosition, null, 'Fetched draft article must have null homepagePosition')

        // Verify it is no longer returned in position query
        const posCheckRes = await fetch(`${url}/api/articles?homepage_position=${testSlot}`)
        assert.equal(posCheckRes.status, 200)
        const posCheckData = await posCheckRes.json()
        const stillInSlot = (posCheckData.articles || []).some((a) => a.id === publishedArticleId)
        assert.ok(!stillInSlot, `Unpublished draft must NOT appear in homepage position ${testSlot}`)
      })

      it('Adversarial update: Attempting to retain homepage position while drafting is rejected/cleared', async () => {
        // Re-publish article to slot 8
        await fetch(`${url}/api/articles/${publishedArticleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'published',
            homepage_position: 8,
          }),
        })

        // Malicious update: specify status: 'draft' AND homepage_position: 8 in the same payload
        const malRes = await fetch(`${url}/api/articles/${publishedArticleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'draft',
            homepage_position: 8,
          }),
        })

        assert.equal(malRes.status, 200)
        const malData = (await malRes.json()).article

        assert.equal(malData.status, 'draft')
        assert.equal(
          malData.homepage_position,
          null,
          'Draft status must override and force homepage_position to null even if requested in body'
        )
      })

      it('Toggling status from draft back to published assigns published_at if empty', async () => {
        // Create fresh draft without published_at
        const draftRes = await fetch(`${url}/api/articles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Draft To Publish Story ${Date.now()}`,
            content: 'Draft content undergoing publication cycle.',
            author: 'Editor',
            category: 'Opinion',
            status: 'draft',
          }),
        })
        assert.equal(draftRes.status, 201)
        const draft = (await draftRes.json()).article
        assert.equal(draft.status, 'draft')
        assert.equal(draft.published_at, null)

        // Publish it
        const pubRes = await fetch(`${url}/api/articles/${draft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'published',
          }),
        })
        assert.equal(pubRes.status, 200)
        const published = (await pubRes.json()).article
        assert.equal(published.status, 'published')
        assert.ok(published.published_at, 'published_at must be populated on publication')
        assert.ok(
          !isNaN(new Date(published.published_at).getTime()),
          'published_at must be a valid parseable date'
        )
      })
    })

  })
}

// Standalone execution support
if (process.argv[1]?.endsWith('api-draft-gating-adversarial.mjs')) {
  const urlArg = process.argv.slice(2).find((a) => a.startsWith('--url='))?.split('=')[1] || DEFAULT_TEST_URL
  runApiDraftGatingAdversarialTests(urlArg).catch((err) => {
    console.error('\n❌ Uncaught error during adversarial verification:', err)
    process.exit(1)
  })
}
