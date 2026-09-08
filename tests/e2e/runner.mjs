#!/usr/bin/env node

/**
 * Meridian Editorial News Platform - Standalone 4-Tier E2E Test Runner
 *
 * Usage:
 *   node tests/e2e/runner.mjs
 *   node tests/e2e/runner.mjs --tier=1
 *   node tests/e2e/runner.mjs --tier=2
 *   node tests/e2e/runner.mjs --tier=3
 *   node tests/e2e/runner.mjs --tier=4
 *   node tests/e2e/runner.mjs --url=http://localhost:3000
 *   node tests/e2e/runner.mjs --mock
 */

import { isServerAvailable, createContractServer } from './fixtures/test-server.mjs'
import { runAdminCrudTests } from './tier1-feature-coverage/test-admin-crud.mjs'
import { runDraftPublishTests } from './tier1-feature-coverage/test-draft-publish.mjs'
import { runSlugGenerationTests } from './tier1-feature-coverage/test-slug-generation.mjs'
import { runMediaPipelineTests } from './tier1-feature-coverage/test-media-pipeline.mjs'
import { runSlotPinningTests } from './tier1-feature-coverage/test-slot-pinning.mjs'
import { runPublicReaderTests } from './tier1-feature-coverage/test-public-reader.mjs'
import { runBookmarkingRailTests } from './tier1-feature-coverage/test-bookmarking-rail.mjs'
import { runAnalyticsTelemetryTests } from './tier1-feature-coverage/test-analytics-telemetry.mjs'

import { runSlugBoundariesTests } from './tier2-boundaries/test-slug-collisions-hindi.mjs'
import { runDraftGatingBoundariesTests } from './tier2-boundaries/test-draft-gating-404.mjs'
import { runSlotBoundsBoundariesTests } from './tier2-boundaries/test-slot-bounds-conflicts.mjs'
import { runMediaFallbacksBoundariesTests } from './tier2-boundaries/test-media-fallbacks.mjs'
import { runReadingTimeStorageBoundariesTests } from './tier2-boundaries/test-reading-time-storage.mjs'

import { runPublishPinReadFlowTests } from './tier3-combinations/test-publish-pin-read-flow.mjs'
import { runBreakingNewsFlowTests } from './tier3-combinations/test-breaking-news-flow.mjs'
import { runHeroCropperRenderFlowTests } from './tier3-combinations/test-hero-cropper-render-flow.mjs'

import { runNewsroomLifecycleWorkflow } from './tier4-workflows/test-newsroom-lifecycle.mjs'
import fs from 'fs'
import path from 'path'

const articlesFilePath = path.join(process.cwd(), 'data', 'articles.json')
let originalArticlesContent = null

const args = process.argv.slice(2)
const tierArg = args.find(a => a.startsWith('--tier='))?.split('=')[1] || 'all'
const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1]
const forceMock = args.includes('--mock')

async function main() {
  try {
    if (fs.existsSync(articlesFilePath)) {
      originalArticlesContent = fs.readFileSync(articlesFilePath, 'utf-8')
    }
  } catch {}

  console.log('\n============================================================')
  console.log('  MERIDIAN EDITORIAL PLATFORM - 4-TIER E2E TEST RUNNER')
  console.log('============================================================\n')

  let baseUrl = urlArg || process.env.TEST_BASE_URL || 'http://localhost:3000'
  let mockServerInstance = null

  if (forceMock) {
    console.log('⚙️  --mock specified: Booting isolated Contract Mock Server...')
    mockServerInstance = await createContractServer(3099)
    baseUrl = mockServerInstance.baseUrl
    console.log(`✅ Contract Mock Server listening at ${baseUrl}\n`)
  } else {
    console.log(`🔍 Checking server availability at ${baseUrl}...`)
    const live = await isServerAvailable(baseUrl)
    if (live) {
      console.log(`✅ Connected to active server at ${baseUrl}\n`)
    } else {
      console.log(`⚠️  No server detected at ${baseUrl}.`)
      console.log(`⚙️  Automatically launching Contract Mock Server on port 3099...`)
      mockServerInstance = await createContractServer(3099)
      baseUrl = mockServerInstance.baseUrl
      console.log(`✅ Contract Mock Server listening at ${baseUrl}\n`)
    }
  }

  const startTime = Date.now()
  let errorOccurred = false

  try {
    // --- Tier 1: Feature Coverage ---
    if (tierArg === 'all' || tierArg === '1') {
      console.log('\n>>> RUNNING TIER 1: FEATURE COVERAGE (Features 1-26) <<<\n')
      await runAdminCrudTests(baseUrl)
      await runDraftPublishTests(baseUrl)
      await runSlugGenerationTests(baseUrl)
      await runMediaPipelineTests(baseUrl)
      await runSlotPinningTests(baseUrl)
      await runPublicReaderTests(baseUrl)
      await runBookmarkingRailTests(baseUrl)
      await runAnalyticsTelemetryTests(baseUrl)
    }

    // --- Tier 2: Boundary & Corner Cases ---
    if (tierArg === 'all' || tierArg === '2') {
      console.log('\n>>> RUNNING TIER 2: BOUNDARY & CORNER CASES <<<\n')
      await runSlugBoundariesTests(baseUrl)
      await runDraftGatingBoundariesTests(baseUrl)
      await runSlotBoundsBoundariesTests(baseUrl)
      await runMediaFallbacksBoundariesTests(baseUrl)
      await runReadingTimeStorageBoundariesTests()
    }

    // --- Tier 3: Cross-Feature Combinations ---
    if (tierArg === 'all' || tierArg === '3') {
      console.log('\n>>> RUNNING TIER 3: CROSS-FEATURE COMBINATIONS <<<\n')
      await runPublishPinReadFlowTests(baseUrl)
      await runBreakingNewsFlowTests(baseUrl)
      await runHeroCropperRenderFlowTests(baseUrl)
    }

    // --- Tier 4: Real-World Workflows ---
    if (tierArg === 'all' || tierArg === '4') {
      console.log('\n>>> RUNNING TIER 4: REAL-WORLD EDITORIAL WORKFLOWS <<<\n')
      await runNewsroomLifecycleWorkflow(baseUrl)
    }
  } catch (err) {
    console.error('\n❌ Test execution encountered an unhandled failure:', err)
    errorOccurred = true
  } finally {
    if (mockServerInstance) {
      console.log('\n🧹 Shutting down mock server...')
      await mockServerInstance.close()
    }
    if (originalArticlesContent) {
      try {
        fs.writeFileSync(articlesFilePath, originalArticlesContent, 'utf-8')
      } catch {}
    }
  }


  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log('\n============================================================')
  console.log(`  TEST RUN COMPLETE: Total Time: ${duration}s`)
  if (errorOccurred) {
    console.log('  STATUS: FAILED ❌')
    process.exit(1)
  } else {
    console.log('  STATUS: ALL EXECUTED SUITES PASSED ✅')
    console.log('============================================================\n')
  }
}

main()
