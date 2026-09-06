# Homepage Position System - Implementation Summary

## ✅ What's Been Created

### 1. Database Schema Update
**File:** `supabase-position-update.sql`
- Adds `homepage_position` column to articles table
- Positions 1-20 for homepage slots
- Position 0 for archived articles
- Position NULL for unassigned
- Unique constraint ensuring only one article per position

### 2. TypeScript Types
**File:** `types/index.ts`
- Added `homepagePosition: number | null` to Article interface
- Added `homepage_position: number | null` to DbArticle interface
- Created `PositionSection` interface for position metadata

### 3. Position Constants & Utilities
**File:** `lib/homepage-positions.ts`
- `HOMEPAGE_POSITIONS`: Array of all 20 positions with metadata
- `getPositionInfo()`: Get position details
- `getPositionName()`: Get display name
- `getPositionBadgeColor()`: Get color coding for badges

### 4. Database Functions
**File:** `lib/articles.ts`
- `getHomepageArticles()`: Fetch all homepage articles (1-20)
- `getArticlesByPosition()`: Fetch specific positions
- `getArchivedArticles()`: Paginated archived articles
- `getAvailablePositions()`: Find empty homepage slots
- `updateArticlePosition()`: Change article position
- `swapArticlePositions()`: Drag & drop position swap
- Updated `createArticle()` and `updateArticle()` to handle positions

### 5. API Routes
**File:** `app/api/articles/homepage/route.ts`
- GET endpoint for homepage articles

**File:** `app/api/articles/swap-positions/route.ts`
- POST endpoint for swapping positions (drag & drop)

### 6. Admin Dashboard Update
**File:** `app/admin/dashboard/page.tsx`
- Added "Position" column to articles table
- Shows position number and name with color coding
- Added "📐 Homepage Layout" button

### 7. Homepage Layout Manager
**File:** `app/admin/homepage-layout/page.tsx`
- Visual drag & drop interface for all 20 positions
- Shows which articles are in which positions
- Color-coded positions by type
- Drag articles to swap positions
- Remove articles from homepage
- Link to assign articles to empty slots

### 8. Documentation
**File:** `HOMEPAGE_SKELETON.md`
- Complete visual layout of 20 positions
- Description of each position's purpose and style

---

## 🔨 What Still Needs to Be Done

### 1. Update Article Create/Edit Forms
Add position selector to:
- `/app/admin/articles/new/page.tsx`
- `/app/admin/articles/[id]/edit/page.tsx`

Add these fields:
```tsx
const [availablePositions, setAvailablePositions] = useState<number[]>([])
const [formData, setFormData] = useState({
  // ... existing fields ...
  homepagePosition: null,  // ADD THIS
})

// Fetch available positions on load
useEffect(() => {
  fetchAvailablePositions()
}, [])

const fetchAvailablePositions = async () => {
  const response = await fetch('/api/articles/available-positions')
  const data = await response.json()
  setAvailablePositions(data.positions)
}

// In the form, add position selector:
<div className="mb-6">
  <label className="block text-sm font-bold mb-2">
    Homepage Position (Optional)
  </label>
  <select
    name="homepagePosition"
    value={formData.homepagePosition || ''}
    onChange={handleChange}
  >
    <option value="">Not on Homepage (Archived)</option>
    <option value="0">Archive (Position 0)</option>
    {HOMEPAGE_POSITIONS.map(pos => (
      <option 
        key={pos.position} 
        value={pos.position}
        disabled={!availablePositions.includes(pos.position)}
      >
        {pos.position}: {pos.name} - {pos.description}
      </option>
    ))}
  </select>
</div>
```

### 2. Create Available Positions API
**File:** `app/api/articles/available-positions/route.ts`
```tsx
import { NextResponse } from 'next/server'
import { getAvailablePositions } from '@/lib/articles'

export async function GET() {
  try {
    const positions = await getAvailablePositions()
    return NextResponse.json({ positions })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch available positions' },
      { status: 500 }
    )
  }
}
```

### 3. Update Homepage (app/page.tsx)
Replace current dynamic fetching with position-based fetching:

```tsx
import { getHomepageArticles } from '@/lib/articles'

export default async function Home() {
  const articles = await getHomepageArticles()
  
  // Create a map of position -> article
  const articlesByPosition = new Map()
  articles.forEach(article => {
    if (article.homepagePosition) {
      articlesByPosition.set(article.homepagePosition, article)
    }
  })
  
  const pos1 = articlesByPosition.get(1)  // Breaking news
  const pos2 = articlesByPosition.get(2)  // Hero main
  const pos3 = articlesByPosition.get(3)  // Hero image
  // etc...
  
  return (
    // Render exactly as per skeleton layout
    // Position 1: Breaking News Banner
    // Position 2-3: Hero Section
    // Position 4-6: Top Stories
    // etc.
  )
}
```

### 4. Create Pagination Pages
**File:** `app/archive/[[...page]]/page.tsx`
```tsx
import { getArchivedArticles } from '@/lib/articles'

export default async function ArchivePage({
  params
}: {
  params: { page?: string[] }
}) {
  const pageNum = params.page?.[0] ? parseInt(params.page[0]) : 1
  const { articles, total } = await getArchivedArticles(pageNum, 20)
  const totalPages = Math.ceil(total / 20)
  
  return (
    // Grid of 20 articles
    // Pagination controls
  )
}
```

### 5. Create Article Assignment Page
**File:** `app/admin/articles/assign/[position]/page.tsx`
- Show list of archived articles (position = 0)
- Allow selecting one to assign to the position
- Update article's homepagePosition field

---

## 📋 Step-by-Step Setup Instructions

1. **Run Database Migration:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- supabase-position-update.sql
   ```

2. **Test Available Features:**
   - Go to `/admin/dashboard` - see position column
   - Click "📐 Homepage Layout" - see drag & drop interface
   - Try dragging articles to swap positions

3. **Complete Remaining Tasks:**
   - Add position selector to create/edit forms
   - Create available-positions API route
   - Update homepage to use position-based layout
   - Create pagination pages for archived articles
   - Create assignment page for empty positions

---

## 🎨 Position Layout Reference

| Pos | Section | Style |
|-----|---------|-------|
| 1 | Breaking News | Full-width banner |
| 2 | Hero Article | Large text, 2/3 width |
| 3 | Hero Image | Image, 1/3 width |
| 4-6 | Top Stories | 3-column grid |
| 7-8 | Featured | 2-column |
| 9-11 | Latest News | 3-column grid |
| 12 | Spotlight | Full-width feature |
| 13-16 | Editor's Picks | 4-column compact |
| 17-18 | Trending | 2-column |
| 19-20 | More Stories | 2-column |

---

## 🚀 Current Status

✅ Complete:
- Database schema with positions
- Position metadata and utilities
- Homepage articles API
- Drag & drop manager UI
- Swap positions API
- Dashboard position display

🔄 In Progress:
- Position selector in forms
- Homepage layout using positions
- Pagination for archives

⏳ To Do:
- Article assignment to positions
- Archive pages (page 2, 3, etc.)
