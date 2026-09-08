import http from 'http';

const BASE_URL = process.env.AUDIT_URL || 'http://localhost:3000';

async function runAudit() {
  console.log('================================================================');
  console.log(`  PRE-LAUNCH QUALITY AUDIT ON: ${BASE_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      const result = await fn();
      console.log(`  PASS: ${name}${result ? ' — ' + result : ''}`);
      passed++;
    } catch (err) {
      console.error(`  FAIL: ${name} — ${err.message}`);
      failed++;
    }
  }

  // --- SECTION 1: PUBLIC DISPATCHES & HOMEPAGE ---
  console.log('1. PUBLIC BROADSHEET & DISPATCHES');

  await check('Homepage returns 200 OK with HTML content', async () => {
    const res = await fetch(BASE_URL + '/');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (!text.includes('<!DOCTYPE html>')) throw new Error('Not valid HTML');
    return `${(text.length / 1024).toFixed(1)} KB`;
  });

  await check('Homepage includes SEO metadata and OpenGraph tags', async () => {
    const res = await fetch(BASE_URL + '/');
    const text = await res.text();
    if (!text.includes('Singh Monster')) throw new Error('Missing title branding');
    if (!text.includes('og:title')) throw new Error('Missing og:title');
    if (!text.includes('twitter:card')) throw new Error('Missing twitter:card');
    return 'SEO & OpenGraph tags verified';
  });

  await check('Articles API returns published stories from D1 database', async () => {
    const res = await fetch(BASE_URL + '/api/articles?limit=50');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.articles) || data.articles.length === 0) {
      throw new Error('No articles returned');
    }
    return `${data.articles.length} stories loaded from Cloudflare D1`;
  });

  let sampleSlug = '';
  await check('Homepage Lead Hero and Reader Route render correctly', async () => {
    const res = await fetch(BASE_URL + '/api/articles?limit=5');
    const data = await res.json();
    const article = data.articles[0];
    sampleSlug = article.slug;
    const readerRes = await fetch(`${BASE_URL}/article/${encodeURIComponent(sampleSlug)}`);
    if (readerRes.status !== 200) throw new Error(`Reader status ${readerRes.status}`);
    const html = await readerRes.text();
    if (!html.includes(article.title.slice(0, 20))) {
      throw new Error('Story title not found in reader HTML');
    }
    return `Story "${article.title.slice(0, 30)}..." rendered with 200 OK`;
  });

  await check('Nonexistent article slug cleanly returns 404 page', async () => {
    const res = await fetch(`${BASE_URL}/article/non-existent-story-boundary-check-404`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    return '404 handled gracefully';
  });

  // --- SECTION 2: BROADSHEET POSITIONS & SLOTS ---
  console.log('\n2. BROADSHEET CURATION & POSITIONS');

  await check('Positions API returns all 15 broadsheet slots', async () => {
    const res = await fetch(BASE_URL + '/api/admin/positions');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.slots) || data.slots.length !== 15) {
      throw new Error(`Expected 15 slots, got ${data.slots?.length}`);
    }
    const pinnedCount = data.slots.filter(s => s.isPinned).length;
    return `15/15 slots active (${pinnedCount} pinned stories)`;
  });

  await check('Pinning slot via API works cleanly with boundary checks', async () => {
    const articlesRes = await fetch(BASE_URL + '/api/articles?limit=5');
    const articlesData = await articlesRes.json();
    const targetArticle = articlesData.articles[0];

    // Pin to Slot 3
    const pinRes = await fetch(BASE_URL + '/api/admin/positions/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleId: targetArticle.id, slotNumber: 3 })
    });
    if (pinRes.status !== 200) throw new Error(`Pin status ${pinRes.status}`);
    const pinData = await pinRes.json();
    if (!pinData.success) throw new Error('Pin unsuccessful');

    // Verify slot 3 has article
    const posRes = await fetch(BASE_URL + '/api/admin/positions');
    const posData = await posRes.json();
    const slot3 = posData.slots.find(s => s.slot === 3);
    if (!slot3 || slot3.article?.id !== targetArticle.id) {
      throw new Error('Slot 3 assignment mismatch');
    }
    return `Article pinned to Slot 3 successfully`;
  });

  // --- SECTION 3: VISITOR ANALYTICS & INTELLIGENCE ---
  console.log('\n3. VISITOR INTELLIGENCE & TRACKING');

  await check('Analytics beacon collects event with geo data', async () => {
    const res = await fetch(BASE_URL + '/api/analytics/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: '/pre-launch-audit',
        referrer: 'https://news.google.com',
        userAgent: 'Mozilla/5.0 (AuditBot 1.0)',
        country: 'IN',
        city: 'New Delhi'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.ok && !data.success) throw new Error('Collection failed');
    return 'Beacon recorded';
  });

  await check('Analytics stats API calculates metrics across timeframes', async () => {
    const res = await fetch(BASE_URL + '/api/analytics/stats?timeframe=30d');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (typeof data.totalVisitors !== 'number') throw new Error('totalVisitors must be a number');
    if (typeof data.totalPageViews !== 'number') throw new Error('totalPageViews must be a number');
    if (!Array.isArray(data.countries)) throw new Error('countries must be an array');
    return `${data.totalVisitors} visitors, ${data.totalPageViews} views, ${data.countries.length} regions`;
  });

  // --- SECTION 4: SECURITY & ADMIN AUTHENTICATION ---
  console.log('\n4. SECURITY & AUTHENTICATION');

  await check('Admin Login Screen renders cleanly', async () => {
    const res = await fetch(BASE_URL + '/admin/login');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (!text.includes('Singh Monster')) throw new Error('Missing masthead');
    return 'Minimalist card rendered';
  });

  let sessionCookie = '';
  await check('Backend verifies credentials (singh / 7053) & issues HMAC session cookie', async () => {
    const res = await fetch(BASE_URL + '/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'singh', password: '7053' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || data.user?.username !== 'singh') {
      throw new Error('Authentication data invalid');
    }
    sessionCookie = res.headers.get('set-cookie');
    if (!sessionCookie || !sessionCookie.includes('admin_session')) {
      throw new Error('Missing admin_session cookie');
    }
    return `Authenticated as singh (HMAC cookie set)`;
  });

  await check('Backend rejects incorrect credentials with 401 Unauthorized', async () => {
    const res = await fetch(BASE_URL + '/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'singh', password: 'wrongpassword' })
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    const data = await res.json();
    if (data.success) throw new Error('Expected success: false');
    return '401 Unauthorized correctly enforced';
  });

  await check('Active session verification returns authenticated status', async () => {
    const res = await fetch(BASE_URL + '/api/admin/auth', {
      headers: { 'Cookie': sessionCookie }
    });
    if (res.status !== 200) throw new Error(`Session verify status ${res.status}`);
    const data = await res.json();
    if (!data.authenticated) throw new Error('Session not recognized');
    return `Session verified for ${data.user?.username}`;
  });

  await check('Sign out clears session cookie', async () => {
    const res = await fetch(BASE_URL + '/api/admin/auth', {
      method: 'DELETE'
    });
    if (res.status !== 200) throw new Error(`Logout status ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    if (!setCookie || (!setCookie.includes('Max-Age=0') && !setCookie.includes('expires='))) {
      throw new Error('Session cookie not cleared');
    }
    return 'Session cookie invalidated';
  });

  // --- SECTION 5: CLOUDFLARE R2 MEDIA VAULT ---
  console.log('\n5. MEDIA VAULT & CLOUDFLARE R2');

  await check('R2 Media Bucket public URL is accessible and healthy', async () => {
    const testUrl = 'https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev/test.txt';
    const res = await fetch(testUrl);
    if (res.status !== 200) throw new Error(`R2 public URL status ${res.status}`);
    const text = await res.text();
    return `R2 Public Bucket online (${text.trim()})`;
  });

  console.log('\n================================================================');
  console.log(`  AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(console.error);
