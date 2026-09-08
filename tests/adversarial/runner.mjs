#!/usr/bin/env node

/**
 * Adversarial & Stress Verification Runner for Milestone 1
 * Executes Devanagari transliteration stress, Unicode edge cases,
 * high-concurrency collision resolution, and ReDoS resistance tests.
 *
 * Usage:
 *   node --experimental-strip-types tests/adversarial/runner.mjs
 *   node --experimental-strip-types tests/adversarial/runner.mjs --url=http://localhost:3001
 */

import { spawn } from 'node:child_process'
import { isServerAvailable } from '../e2e/fixtures/test-server.mjs'
import { runDevanagariUnicodeStressTests } from './devanagari-unicode-stress.mjs'
import { runSlugConcurrencyStressTests } from './slug-concurrency-stress.mjs'
import { runReDoSResourceStressTests } from './redos-resource-stress.mjs'
import { runApiDraftGatingAdversarialTests } from './api-draft-gating-adversarial.mjs'
import {
  runConcurrencyAndPersistenceTests,
  runEventCapBoundaryTests,
  runTrendMathBoundaryTests,
} from './concurrency-persistence-boundary-stress.mjs'


const args = process.argv.slice(2)
const urlArg = args.find((a) => a.startsWith('--url='))?.split('=')[1]

async function waitForServer(url, maxWaitMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    if (await isServerAvailable(url, 500)) return true
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

async function main() {
  console.log('\n======================================================================')
  console.log('  MILESTONE 1 ADVERSARIAL VERIFICATION & STRESS TEST HARNESS')
  console.log('======================================================================\n')

  let serverProcess = null
  let baseUrl = urlArg

  if (!baseUrl) {
    // Check default ports
    if (await isServerAvailable('http://localhost:3001')) {
      baseUrl = 'http://localhost:3001'
      console.log(`🔍 Detected active server at ${baseUrl}`)
    } else if (await isServerAvailable('http://localhost:3000')) {
      baseUrl = 'http://localhost:3000'
      console.log(`🔍 Detected active server at ${baseUrl}`)
    } else {
      console.log('⚙️  No running Next.js server detected. Spawning production server on port 3001...')
      serverProcess = spawn('npx', ['next', 'start', '-p', '3001'], {
        stdio: 'inherit',
        shell: true,
      })

      const ready = await waitForServer('http://localhost:3001', 15000)
      if (ready) {
        baseUrl = 'http://localhost:3001'
        console.log(`✅ Production server live at ${baseUrl}\n`)
      } else {
        console.warn('⚠️  Server spawn timed out. Running unit-level adversarial tests only.\n')
        baseUrl = null
      }
    }
  } else {
    console.log(`🔍 Target server configured via argument: ${baseUrl}`)
  }

  const startTime = Date.now()
  let hasFailure = false

  try {
    console.log('\n>>> SUITE 1: DEVANAGARI TRANSLITERATION & UNICODE STRESS <<<\n')
    await runDevanagariUnicodeStressTests()

    console.log('\n>>> SUITE 2: HIGH-CONCURRENCY & SLUG COLLISION RESOLUTION <<<\n')
    await runSlugConcurrencyStressTests(baseUrl)

    console.log('\n>>> SUITE 3: REDOS & RESOURCE EXHAUSTION RESISTANCE <<<\n')
    await runReDoSResourceStressTests()

    if (baseUrl) {
      console.log('\n>>> SUITE 4: API VALIDATION, DRAFT GATING & CONCURRENCY STRESS <<<\n')
      await runApiDraftGatingAdversarialTests(baseUrl)
    }

    console.log('\n>>> SUITE 5: ANALYTICS CONCURRENCY, PERSISTENCE & BOUNDARY STRESS <<<\n')
    await runConcurrencyAndPersistenceTests()
    await runEventCapBoundaryTests()
    await runTrendMathBoundaryTests()


  } catch (err) {
    console.error('\n❌ Uncaught error during adversarial verification:', err)
    hasFailure = true
  } finally {
    if (serverProcess) {
      console.log('\n🛑 Tearing down spawned test server...')
      serverProcess.kill('SIGTERM')
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log('\n======================================================================')
  if (hasFailure) {
    console.log(`  ❌ ADVERSARIAL VERIFICATION SUITE FAILED (Completed in ${duration}s)`)
    console.log('======================================================================\n')
    process.exit(1)
  } else {
    console.log(`  ✅ ALL ADVERSARIAL VERIFICATION SUITES PASSED EMPIRICALLY (${duration}s)`)
    console.log('======================================================================\n')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
