# Meridian News Platform - Test Infrastructure (TEST_INFRA.md)

## 1. Overview
The Meridian News Platform E2E test suite provides a comprehensive, 4-tier opaque-box automated test framework designed to validate all functional, boundary, cross-module, and editorial workflow requirements specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`.

The test suite runs natively in Node.js 22+ using standard ECMAScript modules (`.mjs`) and the built-in `node:test` and `node:assert/strict` test harness. It operates without external browser automation dependencies (such as Cypress or Playwright daemons), executing HTTP requests against real endpoints and inspecting server-rendered HTML payloads with microsecond execution speed.

---

## 2. Directory Layout
```
/home/aman/Desktop/news/
├── tests/
│   └── e2e/
│       ├── runner.mjs                          # Standalone CLI test runner with tier filtering
│       ├── fixtures/
│       │   ├── articles.mjs                    # Test payloads (English, Hindi, Draft, Breaking, Base64 WebP)
│       │   └── test-server.mjs                 # Server detector & isolated Contract Mock Server
│       ├── helpers/
│       │   ├── api-client.mjs                  # Opaque HTTP client for REST & page endpoints
│       │   ├── dom-parser.mjs                  # HTML inspector for SSR markup & typography
│       │   ├── cropper-math.mjs                # Geometry & 16:10 / 1:1 aspect ratio math
│       │   ├── slug-verifier.mjs               # Transliteration oracle & URL-safety validator
│       │   ├── reading-time.mjs                # 200 WPM & "1 min read" floor oracle
│       │   └── dedup-engine.mjs                # Broadsheet slots 1-15 deduplication simulator
│       ├── tier1-feature-coverage/
│       │   ├── test-admin-crud.mjs             # Features 1, 4, 11, 12, 13
│       │   ├── test-draft-publish.mjs          # Feature 5
│       │   ├── test-slug-generation.mjs        # Feature 3
│       │   ├── test-media-pipeline.mjs         # Features 6, 7, 8, 9, 10, 14
│       │   ├── test-slot-pinning.mjs           # Features 15, 16, 17, 18, 19
│       │   ├── test-public-reader.mjs          # Features 20, 21, 22, 23, 24
│       │   └── test-bookmarking-rail.mjs       # Features 25, 26
│       ├── tier2-boundaries/
│       │   ├── test-slug-collisions-hindi.mjs   # Boundary: Collisions, conjuncts, Devanagari digits
│       │   ├── test-draft-gating-404.mjs        # Boundary: 404 on drafts, SQL injection, empty title
│       │   ├── test-slot-bounds-conflicts.mjs   # Boundary: Slot <1 or >15, non-existent IDs, swaps
│       │   ├── test-media-fallbacks.mjs         # Boundary: Non-image MIME, empty buffers, extreme crops
│       │   └── test-reading-time-storage.mjs    # Boundary: Empty body floor, corrupted localStorage
│       ├── tier3-combinations/
│       │   ├── test-publish-pin-read-flow.mjs   # Combo: Publish -> Pin Slot 2 -> Homepage -> Reader -> Bookmark
│       │   ├── test-breaking-news-flow.mjs      # Combo: Breaking flag -> Slot 1 Ticker -> Homepage live bar
│       │   └── test-hero-cropper-render-flow.mjs# Combo: 16:10 Crop -> Upload -> Hero designation -> Reader caption
│       └── tier4-workflows/
│           └── test-newsroom-lifecycle.mjs      # Full Lifecycle: 9-phase complete editorial newsroom flow
├── TEST_INFRA.md                               # This documentation
└── TEST_READY.md                               # Test readiness report & coverage certification
```

---

## 3. The 4-Tier Test Architecture

### Tier 1 — Feature Coverage (Features 1–26)
Verifies discrete functional requirements from the `PROJECT.md` Feature Inventory:
- **Admin CMS CRUD & Data Model** (`test-admin-crud.mjs`): Tests `GET /api/articles`, `POST /api/articles`, `GET /api/articles/:id`, `PUT /api/articles/:id`, `DELETE /api/articles/:id`, and admin authentication.
- **Draft & Publish Lifecycle** (`test-draft-publish.mjs`): Verifies draft status gating, automatic `published_at` timestamping, and 404 gating from public reader.
- **Multilingual Slug Generation** (`test-slug-generation.mjs`): Verifies URL-safe ASCII slugification, Devanagari transliteration, and collision avoidance.
- **Media Pipeline & Cropper** (`test-media-pipeline.mjs`): Verifies `POST /api/media/upload`, 16:10 and 1:1 aspect ratio geometry, centered crop computation, and primary hero designation.
- **Broadsheet Slot Pinning** (`test-slot-pinning.mjs`): Verifies position curation API (`/api/admin/positions`, `/pin`, `/unpin`), slots 1–15 deduplication, and breaking ticker feed.
- **Dynamic Public Article Reader** (`test-public-reader.mjs`): Verifies `/article/:slug` 200 response, Source Serif 4 typography, lead paragraph drop-cap, 16:10 hero caption with photo credit (`[Caption] | Photo: [Credit]`), and reading time calculation.
- **Bookmarking & Related Stories** (`test-bookmarking-rail.mjs`): Verifies client bookmark toggle button, set-based bookmarking state management, and related stories rail excluding current article.

### Tier 2 — Boundary & Corner Cases
Exercises adversarial and edge-case inputs:
- **Slug Collisions & Hindi Complexities** (`test-slug-collisions-hindi.mjs`): Repeated identical titles producing `-1`, `-2`, `-3` suffixes; Hindi conjuncts with halant, nukta, and matras; Devanagari digits `२०२६` -> `2026`; numeric titles; extreme whitespace.
- **Draft Gating & 404 Handling** (`test-draft-gating-404.mjs`): Empty titles rejected with 400 Bad Request; non-existent slugs returning 404; unpublished drafts returning 404; path traversal (`../../etc/passwd`) and SQL injection (`' OR '1'='1`) sanitized and returning 404.
- **Slot Boundaries & Conflicts** (`test-slot-bounds-conflicts.mjs`): Slot numbers `< 1` or `> 15` rejected with 400; pinning nonexistent IDs returning 404; unpinning unpinned slots is idempotent; slot overwrites cleanly reassign positions.
- **Media Fallbacks & Extreme Crops** (`test-media-fallbacks.mjs`): Non-image MIME types (`text/plain`, `application/pdf`) rejected; 0-byte uploads rejected; super-wide (4000x500) and super-tall (500x4000) image crops remain strictly within source boundaries.
- **Reading Time & Storage Resilience** (`test-reading-time-storage.mjs`): 0 words / null / undefined strictly enforces "1 min read" floor; step transition from 200 to 201 words; corrupted localStorage JSON recovered gracefully without crashing; `QuotaExceededError` handled safely.

### Tier 3 — Cross-Feature Combinations
Validates multi-module integration chains:
- **Publish -> Pin Slot 2 -> Homepage -> Reader -> Bookmark** (`test-publish-pin-read-flow.mjs`): Publishes article -> Pins to Slot 2 -> Renders on homepage hero -> Opens `/article/:slug` -> Toggles bookmark -> Verifies in bookmark store.
- **Breaking News Story -> Slot 1 Ticker -> Homepage Feed** (`test-breaking-news-flow.mjs`): Publishes with `is_breaking: true` -> Pinned to Slot 1 -> Live ticker displays headline and link on `/`.
- **Cropped 16:10 Hero -> R2 Upload -> Hero Designation -> Reader Caption** (`test-hero-cropper-render-flow.mjs`): Computes 16:10 crop -> Uploads to R2 -> Assigns as primary hero with formal caption -> Verifies reader view renders `<figure>` with `[Caption] | Photo: [Credit]`.

### Tier 4 — Real-World Editorial Workflows
- **Complete Newsroom Lifecycle** (`test-newsroom-lifecycle.mjs`): A 9-phase chronological scenario:
  1. Author drafts investigative article in Admin CMS.
  2. Public reader and homepage verified not to leak draft.
  3. Author crops raw photography to 16:10 and attaches formal credit caption.
  4. Author checks reading time and publishes article.
  5. Editor pins article to Slot 2 (Lead Hero Story).
  6. Reader visits `/` and discovers story on broadsheet front page.
  7. Reader reads `/article/:slug` with Meridian Source Serif 4, drop-cap, and photo credit.
  8. Reader bookmarks story.
  9. Editorial desk unpins/cleans up slot.

---

## 4. How to Run the Tests

### Quick Run
```bash
# Run the complete test suite (all 4 tiers)
npm test

# OR directly via Node.js
node tests/e2e/runner.mjs
```

### Running Specific Tiers
```bash
# Run Tier 1 only (Feature Coverage)
node tests/e2e/runner.mjs --tier=1

# Run Tier 2 only (Boundary & Corner Cases)
node tests/e2e/runner.mjs --tier=2

# Run Tier 3 only (Cross-Feature Combinations)
node tests/e2e/runner.mjs --tier=3

# Run Tier 4 only (Real-World Editorial Workflows)
node tests/e2e/runner.mjs --tier=4
```

### Running Against Live vs Mock Server
- **Auto-Detect Mode (Default)**: Checks `http://localhost:3000` (or `process.env.TEST_BASE_URL`). If active, tests run against the live Next.js application. If offline, the runner automatically boots the internal Contract Mock Server on port 3099.
- **Explicit Live URL**:
  ```bash
  node tests/e2e/runner.mjs --url=http://localhost:3000
  ```
- **Explicit Mock Server Mode**:
  ```bash
  node tests/e2e/runner.mjs --mock
  ```

---

## 5. Test Isolation & Determinism
1. **Self-Contained Payloads**: Every test generates unique timestamped slugs/titles (`Date.now()`) to prevent state collision between runs.
2. **Idempotent Pinning**: Slot pinning tests explicitly clean up or overwrite slots at conclusion.
3. **Hermetic Mock Fallback**: The contract mock server runs purely in-memory and terminates gracefully in the runner's `finally` block.
4. **Zero Flakiness**: All timing dependencies and asynchronous fetches utilize standard promise resolution without arbitrary sleeps.
