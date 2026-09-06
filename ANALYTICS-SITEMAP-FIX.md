# Analytics & Sitemap Troubleshooting Guide

## 🚨 Issues Identified

### 1. Sitemap Error in Google Search Console
**Error:** "Sitemap is HTML" instead of XML
**Impact:** Google cannot properly crawl and index your pages

### 2. Analytics Not Showing Data
**Possible Causes:**
- GA Measurement ID not configured
- Script not loading
- Ad blockers
- Recent deployment (data takes 24-48 hours)

---

## 🔧 Fix 1: Sitemap Issue

### Problem
Google Search Console is detecting your sitemap as HTML instead of XML format.

### Solution Steps

#### Step 1: Verify Your Environment Variables
Create or update `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=https://chhkwa.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Replace with your actual GA4 ID
```

#### Step 2: Rebuild Your Application
```bash
npm run build
```

#### Step 3: Test Sitemap Locally
After building, start the production server:
```bash
npm run start
```

Visit: `http://localhost:3000/sitemap.xml`

**Expected Output:** XML format like this:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chhkwa.com/</loc>
    <lastmod>2025-10-26</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  ...
</urlset>
```

#### Step 4: Deploy to Production
Deploy your site to your production domain (not localhost).

#### Step 5: Verify Production Sitemap
Visit: `https://chhkwa.com/sitemap.xml`

Should show XML format, not HTML.

#### Step 6: Resubmit to Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (chhkwa.com)
3. Go to **Sitemaps** (left sidebar)
4. Remove the old sitemap if it exists
5. Add new sitemap: `https://chhkwa.com/sitemap.xml`
6. Click **Submit**
7. Wait 24-48 hours for Google to recrawl

---

## 🔧 Fix 2: Google Analytics Not Showing Data

### Step 1: Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (bottom left)
3. Under **Property**, click **Data Streams**
4. Click your web data stream
5. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)

### Step 2: Add to Environment Variables

Update `.env.local`:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Replace `G-XXXXXXXXXX` with your actual Measurement ID!**

### Step 3: Verify in Layout.tsx

The layout file at `/app/layout.tsx` should have:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  return (
    <html lang="en">
      <head>
        {/* ... other head content ... */}
      </head>
      <body>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {children}
      </body>
    </html>
  )
}
```

### Step 4: Rebuild and Deploy

```bash
npm run build
npm run start  # Test locally
# Then deploy to production
```

### Step 5: Test Analytics

#### A. Check if Script is Loading
1. Visit your site: `https://chhkwa.com`
2. Open DevTools (F12)
3. Go to **Network** tab
4. Filter by "gtag"
5. You should see requests to `googletagmanager.com`

#### B. Use Google Analytics DebugView
1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) extension
2. Enable it
3. Visit your site
4. Go to GA4 → **Admin** → **DebugView**
5. You should see real-time events

#### C. Wait for Data
- **Real-time data:** Shows within minutes
- **Reports data:** Takes 24-48 hours to appear

---

## 🔍 Common Issues & Solutions

### Issue 1: "Sitemap is HTML"

**Cause:** Next.js not generating XML properly or wrong URL

**Solution:**
```bash
# Make sure you're accessing the right URL
✅ Correct: https://chhkwa.com/sitemap.xml
❌ Wrong: https://chhkwa.com/sitemap
❌ Wrong: http://localhost:3000/sitemap.xml (in Search Console)
```

### Issue 2: Analytics Shows No Data

**Possible Causes & Solutions:**

#### A. GA ID Not Set
```bash
# Check .env.local exists and has:
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### B. Using Wrong GA Version
```
❌ Old Universal Analytics (UA-XXXXXXX)
✅ New GA4 (G-XXXXXXXXXX)
```

#### C. Ad Blocker Enabled
- Disable ad blockers
- Test in incognito mode
- Use different browser

#### D. Script Not Loading
Check console for errors:
```javascript
// Open DevTools Console
console.log(window.gtag)  // Should show function
console.log(window.dataLayer)  // Should show array
```

#### E. Recent Deployment
- Wait 24-48 hours
- Check GA4 Real-time report first
- Standard reports update with delay

### Issue 3: Sitemap Has 0 Discovered Pages

**Causes:**
- Sitemap format error (HTML instead of XML)
- URLs not accessible (404 errors)
- robots.txt blocking crawlers
- New site (wait for Google to crawl)

**Solutions:**
1. Fix sitemap format (see Fix 1)
2. Test individual URLs manually
3. Check robots.txt: `https://chhkwa.com/robots.txt`
4. Wait 1-2 weeks for Google to crawl

---

## ✅ Verification Checklist

### Sitemap
- [ ] `.env.local` has correct `NEXT_PUBLIC_BASE_URL`
- [ ] Rebuilt app with `npm run build`
- [ ] Deployed to production domain
- [ ] `https://chhkwa.com/sitemap.xml` shows XML (not HTML)
- [ ] Submitted sitemap to Google Search Console
- [ ] Waited 24-48 hours for recrawl

### Analytics
- [ ] `.env.local` has correct `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] GA ID starts with `G-` (not `UA-`)
- [ ] Rebuilt and deployed
- [ ] Google Analytics script loads (check Network tab)
- [ ] Can see events in GA4 DebugView
- [ ] Waited 24-48 hours for data

### General
- [ ] Site is live on production domain (not localhost)
- [ ] No 404 errors on main pages
- [ ] robots.txt allows crawling
- [ ] ads.txt file is accessible

---

## 🧪 Testing Commands

### Test Sitemap Locally
```bash
# Build
npm run build

# Start production server
npm run start

# Visit in browser
open http://localhost:3000/sitemap.xml

# Or use curl
curl http://localhost:3000/sitemap.xml
```

Should output XML, not HTML.

### Test Analytics
```bash
# Check if GA ID is set
echo $NEXT_PUBLIC_GA_MEASUREMENT_ID

# Should show: G-XXXXXXXXXX
```

### Test Production URLs
```bash
# Test sitemap
curl -I https://chhkwa.com/sitemap.xml

# Should return:
# HTTP/2 200
# content-type: application/xml

# Test robots.txt
curl https://chhkwa.com/robots.txt

# Test ads.txt
curl https://chhkwa.com/ads.txt
```

---

## 📊 Expected Timeline

### Sitemap
- **Submit:** Immediate
- **Google crawls:** 1-7 days
- **Status updates:** 1-2 weeks
- **Full indexing:** 2-4 weeks

### Analytics
- **Real-time data:** 5-10 minutes after deployment
- **Reports data:** 24-48 hours
- **Historical data:** Accumulates over time

---

## 🆘 Still Not Working?

### For Sitemap Issues:

1. **Check Next.js Version**
   ```bash
   npm list next
   ```
   Should be 14.x or higher

2. **Manual Sitemap Test**
   ```bash
   # In your project
   npm run build
   npm run start
   
   # In another terminal
   curl http://localhost:3000/sitemap.xml | head -20
   ```
   Should show XML with `<?xml version` at top

3. **Check Build Output**
   Look for errors during `npm run build`

### For Analytics Issues:

1. **Verify GA4 Property**
   - Must be GA4 (not Universal Analytics)
   - Property should be active
   - Data stream should be web (not app)

2. **Check Browser Console**
   ```javascript
   // Type in console:
   window.gtag
   window.dataLayer
   
   // Should both exist
   ```

3. **Use Google Tag Assistant**
   - Install [Google Tag Assistant](https://tagassistant.google.com/)
   - Connect your GA4 property
   - Visit your site
   - Check if tags fire correctly

---

## 📝 Quick Fix Summary

### Sitemap Fix (5 minutes):
```bash
# 1. Set base URL in .env.local
echo "NEXT_PUBLIC_BASE_URL=https://chhkwa.com" >> .env.local

# 2. Rebuild
npm run build

# 3. Deploy to production

# 4. Verify
curl https://chhkwa.com/sitemap.xml

# 5. Resubmit to Search Console
# Visit: https://search.google.com/search-console
```

### Analytics Fix (5 minutes):
```bash
# 1. Get GA4 Measurement ID from analytics.google.com
# Looks like: G-XXXXXXXXXX

# 2. Add to .env.local
echo "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX" >> .env.local

# 3. Rebuild
npm run build

# 4. Deploy to production

# 5. Test in GA4 DebugView
# Visit: https://analytics.google.com/ → DebugView
```

---

## 📞 Support Resources

- [Next.js Sitemap Docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics 4](https://analytics.google.com/)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)

---

**Remember:** Both sitemap indexing and analytics data collection take time. After fixing, wait 24-48 hours before checking again!
