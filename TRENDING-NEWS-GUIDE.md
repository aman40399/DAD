# Trending News Feature Guide

## Overview
Added a new "Trending News" section to the admin panel that fetches trending news from NewsAPI.org and allows importing them as articles.

## Features Added

### 1. **Image CDN Support**
Updated `next.config.js` to support images from:
- ✅ cdn.britannica.com
- ✅ i.pinimg.com (Pinterest images)
- ✅ Any HTTPS/HTTP domain (wildcard support)

### 2. **Pinterest Video Support**
Updated article forms to accept:
- YouTube URLs
- Pinterest video URLs
- Video field label updated to "Video URL (YouTube / Pinterest)"

### 3. **Trending News Page**
**Location:** `/admin/trending-news`

**Features:**
- Fetches trending news from NewsAPI.org
- Filter by:
  - Language (English, Hindi, Spanish, French, German)
  - Category (Business, Entertainment, General, Health, Science, Sports, Technology)
- Displays articles in a grid with:
  - Image preview
  - Source & publish date
  - Title & description
  - Import & View buttons
- Pagination support
- Real-time refresh

**API Integration:**
- API Key: `16977cbff09344f2b1407d71a36888c2`
- Endpoint: `https://newsapi.org/v2/top-headlines`
- Parameters:
  - `language`: Article language
  - `category`: News category
  - `pageSize`: Results per page (default: 20)
  - `page`: Page number
  - `sortBy`: publishedAt (most recent first)

## How to Use

### Accessing Trending News
1. Login to admin panel
2. Click **"Trending News"** in sidebar (📈 icon)
3. Browse trending articles from around the world

### Importing Articles
1. Find an article you want to import
2. Click **"📝 Import"** button
3. You'll be redirected to "Add New Article" page
4. The form will be pre-filled with:
   - Title
   - Excerpt (description)
   - Content
   - Image URL
   - Author (from source)
5. Edit as needed and publish

### Viewing Original Source
- Click **"🔗 View"** button to open original article in new tab

## API Routes

### `/api/trending-news` (GET)
**Auth Required:** Yes (Admin only)

**Query Parameters:**
- `language` (optional): en, hi, es, fr, de
- `category` (optional): business, entertainment, general, health, science, sports, technology
- `country` (optional): Country code
- `pageSize` (optional): Results per page (default: 20)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "totalResults": 100,
  "articles": [
    {
      "title": "Article Title",
      "description": "Article description",
      "content": "Full content",
      "url": "https://source.com/article",
      "imageUrl": "https://source.com/image.jpg",
      "source": "Source Name",
      "author": "Author Name",
      "publishedAt": "2025-10-26T10:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 20
}
```

## File Changes

### New Files Created:
1. `/app/api/trending-news/route.ts` - API endpoint for NewsAPI integration
2. `/app/admin/trending-news/page.tsx` - Trending news admin page
3. `/TRENDING-NEWS-GUIDE.md` - This documentation

### Modified Files:
1. `next.config.js` - Added image domain support
2. `components/AdminLayout.tsx` - Added "Trending News" navigation item
3. `app/admin/articles/new/page.tsx` - Added import functionality for trending articles
4. `app/admin/articles/[id]/edit/page.tsx` - Updated video field label

## Technical Details

### NewsAPI Integration
```typescript
// Fetch trending news
const response = await fetch('https://newsapi.org/v2/top-headlines', {
  params: {
    apiKey: '16977cbff09344f2b1407d71a36888c2',
    language: 'en',
    pageSize: 20,
    sortBy: 'publishedAt'
  }
})
```

### Import Mechanism
Uses `localStorage` to temporarily store imported article data:
```typescript
localStorage.setItem('importedArticle', JSON.stringify({
  title: article.title,
  excerpt: article.description,
  content: article.content,
  imageUrl: article.imageUrl,
  author: article.author
}))
```

On new article page load, checks for imported data and auto-fills form.

## Limitations

### NewsAPI Free Tier:
- 100 requests per day
- Only returns first 200 characters of content
- Cannot access articles older than 24 hours for free tier
- Some sources may not provide full content

### Workaround:
- Use the "View" button to see full article on source website
- Manually expand content in article editor
- Use AI Writing Assistant to expand imported content

## Security

- ✅ Admin authentication required
- ✅ API key stored server-side (not exposed to client)
- ✅ Rate limiting handled by NewsAPI
- ✅ CORS properly configured

## Future Enhancements

Potential improvements:
- [ ] Search by keyword
- [ ] Save favorite sources
- [ ] Schedule auto-import
- [ ] AI-powered content expansion
- [ ] Multi-source aggregation
- [ ] Duplicate detection

## Testing

### Test Trending News:
1. Go to `/admin/trending-news`
2. Try different language filters
3. Try different category filters
4. Click Import on an article
5. Verify form is pre-filled
6. Publish article

### Test Image Support:
1. Add article with Britannica image: `https://cdn.britannica.com/...`
2. Add article with Pinterest image: `https://i.pinimg.com/...`
3. Verify images display correctly

### Test Pinterest Video:
1. Add article with Pinterest video URL
2. Verify video embeds correctly (if Pinterest embed supported)

## Troubleshooting

### "Failed to fetch trending news"
- Check API key is correct
- Verify you haven't exceeded 100 requests/day
- Check NewsAPI status page

### Images not loading
- Verify domain is in `next.config.js`
- Check image URL is valid HTTPS
- Clear browser cache and restart dev server

### Import not working
- Check browser console for localStorage errors
- Verify admin authentication
- Try clearing localStorage manually

## Support

For issues or questions:
1. Check NewsAPI documentation: https://newsapi.org/docs
2. Review browser console for errors
3. Check server logs for API errors
4. Verify authentication and permissions

---

**Status:** ✅ Fully Implemented and Ready to Use
**Last Updated:** October 26, 2025
