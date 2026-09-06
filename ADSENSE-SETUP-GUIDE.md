# Google AdSense Setup Guide

## ✅ What Has Been Done

### 1. Global AdSense Script Added
The AdSense script has been added to `/app/layout.tsx` in the `<head>` section:

```tsx
<script 
  async 
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2180926216252078"
  crossOrigin="anonymous"
/>
```

**Result:** This script now loads on **every page** of your website automatically.

### 2. ads.txt File Created
Created `/public/ads.txt` with your publisher ID:

```
google.com, pub-2180926216252078, DIRECT, f08c47fec0942fa0
```

**Result:** This file will be accessible at `https://yourdomain.com/ads.txt` and verifies your AdSense account.

### 3. AdSense Component Created
Created `/components/AdSense.tsx` - a reusable component for placing ads anywhere on your site.

---

## 📍 Where Ads Will Appear

### Automatically Loaded
The AdSense script is now loaded on:
- ✅ Homepage
- ✅ Article pages
- ✅ Section pages
- ✅ Author pages
- ✅ Search pages
- ✅ About page
- ✅ Admin pages
- ✅ **Every single page on your site**

---

## 🎯 How to Place Ads on Specific Pages

You can now use the `AdSense` component to place ads anywhere you want.

### Example 1: Add Ad to Article Page

Edit `/app/article/[slug]/page.tsx`:

```tsx
import AdSense from '@/components/AdSense'

export default function ArticlePage() {
  return (
    <div>
      {/* Your article content */}
      
      {/* Ad after first paragraph */}
      <AdSense 
        adSlot="1234567890"  // Replace with your ad slot ID
        adFormat="auto"
        fullWidthResponsive={true}
      />
      
      {/* More content */}
    </div>
  )
}
```

### Example 2: Add Ad to Homepage

Edit `/app/page.tsx`:

```tsx
import AdSense from '@/components/AdSense'

export default function HomePage() {
  return (
    <div>
      {/* Top stories */}
      
      {/* Ad between sections */}
      <div className="my-8">
        <AdSense 
          adSlot="1234567890"
          adFormat="auto"
          fullWidthResponsive={true}
        />
      </div>
      
      {/* More content */}
    </div>
  )
}
```

### Example 3: Sidebar Ad

```tsx
<div className="sidebar">
  {/* Sticky sidebar ad */}
  <div className="sticky top-4">
    <AdSense 
      adSlot="1234567890"
      adFormat="vertical"
      style={{ display: 'block', width: '300px', height: '600px' }}
    />
  </div>
</div>
```

### Example 4: In-Feed Ad

```tsx
<div className="article-list">
  {articles.slice(0, 3).map(article => (
    <ArticleCard key={article.id} article={article} />
  ))}
  
  {/* Ad after 3rd article */}
  <AdSense 
    adSlot="1234567890"
    adFormat="fluid"
    adLayout="in-article"
  />
  
  {articles.slice(3).map(article => (
    <ArticleCard key={article.id} article={article} />
  ))}
</div>
```

---

## 🔧 AdSense Component Props

```tsx
<AdSense 
  adSlot="1234567890"           // REQUIRED: Your ad unit ID
  adFormat="auto"                // Optional: 'auto', 'fluid', 'rectangle', etc.
  adLayout="in-article"          // Optional: 'in-article', 'in-feed', etc.
  adLayoutKey="xyz"              // Optional: Layout key for matched content
  fullWidthResponsive={true}     // Optional: Makes ad responsive (default: true)
  style={{ display: 'block' }}   // Optional: Custom styles
  className="my-ad-class"        // Optional: Custom CSS class
/>
```

---

## 📊 Common Ad Formats

### 1. Auto Ads (Recommended)
```tsx
<AdSense 
  adSlot="YOUR_AD_SLOT"
  adFormat="auto"
  fullWidthResponsive={true}
/>
```

### 2. Display Ads (Fixed Size)
```tsx
<AdSense 
  adSlot="YOUR_AD_SLOT"
  adFormat="rectangle"
  style={{ display: 'block', width: '336px', height: '280px' }}
  fullWidthResponsive={false}
/>
```

### 3. In-Article Ads
```tsx
<AdSense 
  adSlot="YOUR_AD_SLOT"
  adFormat="fluid"
  adLayout="in-article"
/>
```

### 4. In-Feed Ads
```tsx
<AdSense 
  adSlot="YOUR_AD_SLOT"
  adFormat="fluid"
  adLayout="in-feed"
  adLayoutKey="YOUR_LAYOUT_KEY"
/>
```

### 5. Multiplex Ads
```tsx
<AdSense 
  adSlot="YOUR_AD_SLOT"
  adFormat="autorelaxed"
/>
```

---

## ⚙️ Getting Your Ad Slot IDs

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Click on **Ads** → **By ad unit**
3. Create a new ad unit or use existing ones
4. Copy the **data-ad-slot** number
5. Use it in the `adSlot` prop

Example:
```html
<!-- From AdSense: -->
<ins data-ad-slot="1234567890"></ins>

<!-- In your code: -->
<AdSense adSlot="1234567890" />
```

---

## ✅ Verification Steps

### 1. Check ads.txt File
Visit: `https://yourdomain.com/ads.txt`

Should show:
```
google.com, pub-2180926216252078, DIRECT, f08c47fec0942fa0
```

### 2. Check AdSense Dashboard
1. Go to AdSense dashboard
2. Navigate to **Sites**
3. Check if your site shows as "Getting ready" or "Authorized"
4. Wait for Google to crawl your ads.txt file (can take 24-48 hours)

### 3. Test Ad Loading (Dev Mode)
Ads won't show in development mode (`localhost`). To test:
1. Build and deploy your site to production
2. Wait 24-48 hours for AdSense approval
3. Visit your site and check for ads

---

## 🚀 Recommended Ad Placements

### Homepage
- ✅ After header (leaderboard)
- ✅ Between article lists (after 3-5 articles)
- ✅ Sidebar (sticky)
- ✅ Before footer

### Article Pages
- ✅ After title/before content (responsive)
- ✅ After first paragraph (in-article)
- ✅ Mid-article (after 3-4 paragraphs)
- ✅ Sidebar (sticky)
- ✅ End of article (recommended content)

### Section Pages
- ✅ Top of page (leaderboard)
- ✅ Between article cards
- ✅ Sidebar

---

## ⚠️ Important Notes

### 1. Don't Overdo It
- **Too many ads = bad user experience**
- Recommended: 3-4 ads per page maximum
- Space ads evenly throughout content

### 2. Mobile Optimization
- Use `fullWidthResponsive={true}` for mobile-friendly ads
- Avoid fixed-size ads on mobile
- Test on different screen sizes

### 3. Ad Policy Compliance
- Don't click your own ads
- Don't ask users to click ads
- Don't place ads on error pages
- Follow [AdSense Program Policies](https://support.google.com/adsense/answer/48182)

### 4. Performance
- Ads load asynchronously (won't block page load)
- Use lazy loading for below-the-fold ads
- Monitor Core Web Vitals

---

## 🐛 Troubleshooting

### Ads Not Showing?

**1. Check if you're in development mode:**
- Ads only show in production
- Deploy to your live domain to test

**2. Check AdSense account status:**
- Account must be approved
- Site must be verified
- ads.txt must be crawled

**3. Check browser console:**
- Open DevTools → Console
- Look for AdSense errors
- Common issues:
  - Ad blocker enabled
  - Invalid ad slot ID
  - Script not loaded

**4. Wait 24-48 hours:**
- New accounts take time to activate
- ads.txt takes time to be crawled
- Be patient!

### "ads.txt Not Found" Error?

**Solution:**
1. Make sure `/public/ads.txt` exists
2. Rebuild your Next.js app: `npm run build`
3. Deploy to production
4. Wait 24 hours for Google to recrawl
5. Check AdSense dashboard

---

## 📈 Optimization Tips

### 1. Use Auto Ads (Easiest)
Let Google automatically place ads:
1. Go to AdSense → Ads → Auto ads
2. Enable auto ads for your site
3. Google will automatically insert ads

### 2. A/B Test Ad Placements
- Try different positions
- Monitor performance in AdSense
- Keep what works best

### 3. Monitor Performance
- Check AdSense dashboard regularly
- Track: Impressions, Clicks, RPM, CTR
- Optimize based on data

### 4. Use Responsive Ads
- Better mobile experience
- Higher fill rates
- More revenue

---

## 📞 Support

### Google AdSense Support
- [AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community Forum](https://support.google.com/adsense/community)
- [Contact AdSense Support](https://support.google.com/adsense/answer/1705885)

### Your Publisher ID
```
ca-pub-2180926216252078
```

---

## 🎉 Summary

✅ **AdSense script loaded on every page**
✅ **ads.txt file created and accessible**
✅ **Reusable AdSense component available**
✅ **Ready to place ads anywhere on your site**

**Next Steps:**
1. Deploy your site to production
2. Wait for Google to verify ads.txt
3. Create ad units in AdSense dashboard
4. Add AdSense components to your pages
5. Monitor performance and optimize!

Your site is now fully set up for Google AdSense! 🚀
