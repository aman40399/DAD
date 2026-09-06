# Supabase Setup Steps

## Required SQL Migrations

Run these SQL files in your Supabase SQL Editor in order:

### 1. Make image_url nullable
```bash
File: supabase-imageurl-nullable.sql
```
This allows creating articles without images.

### 2. Add homepage position system
```bash
File: supabase-position-update.sql
```
Adds the `homepage_position` column for the 20-position skeleton layout.

### 3. Create images storage bucket
**Option A: Via Supabase Dashboard (Recommended)**
1. Go to Storage in Supabase Dashboard
2. Click "New bucket"
3. Name: `images`
4. Make it **Public**
5. Click Create

**Option B: Via SQL**
```sql
-- Run the SQL in supabase-create-images-bucket.sql
-- Note: Creating buckets via SQL is tricky, use Dashboard instead
```

## Verify Setup

After running migrations, verify:

```sql
-- Check image_url is nullable
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'image_url';

-- Check homepage_position exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' AND column_name = 'homepage_position';

-- Check images bucket exists
SELECT * FROM storage.buckets WHERE name = 'images';
```

## Features Implemented

### ✅ Image Upload with Cropping
- **Component**: `components/ImageUploader.tsx`
- **Usage**: Integrated in new article form
- **Features**: 
  - Select image from file system
  - Crop to 16:9 aspect ratio
  - Upload to Supabase storage `images` bucket
  - Returns public URL

### ✅ YouTube Autoplay Muted
- **Component**: `components/YouTubeEmbed.tsx`
- **Features**: Videos autoplay with sound muted
- **Parameters**: autoplay=1, mute=1, controls=1, rel=0, modestbranding=1

### ✅ Splash Screen Animation
- **Component**: `components/Splash.tsx`
- **Features**: Shows "CHKKWA" for 2 seconds on homepage load with pulse animation
- **Styling**: Fixed overlay, centered text, fades out after 2s

### ✅ Skeleton Loading UI
- **Component**: `components/SkeletonArticle.tsx`
- **Usage**: Shows placeholder when article has no image
- **Variants**: 'card' (full preview) and 'list' (compact)

### ✅ Homepage Position System
- **Files**: 
  - `lib/homepage-positions.ts` - Position metadata
  - `app/admin/homepage-layout/page.tsx` - Drag & drop manager
  - `app/admin/articles/assign/[position]/page.tsx` - Article assignment
- **Features**:
  - 20 fixed homepage positions
  - Drag & drop to reorder
  - Assign archived articles to positions
  - Shows current assigned article

### ✅ Article Assignment Page
- **Route**: `/admin/articles/assign/[position]`
- **Features**:
  - Shows currently assigned article
  - Browse archived articles
  - Search by title/excerpt
  - Filter by category
  - One-click assignment

## Next Steps

1. **Run SQL migrations** in Supabase (image_url nullable + homepage_position)
2. **Create images bucket** in Supabase Storage (via Dashboard)
3. **Test image upload** in new article form
4. **Assign articles** to homepage positions using drag & drop
5. **Verify YouTube videos** autoplay muted
6. **Check splash screen** shows on homepage

## Notes

- Image URLs from Supabase storage will look like: `https://[project-ref].supabase.co/storage/v1/object/public/images/[filename]`
- Cropped images are saved as JPEGs with 90% quality
- Homepage positions: 1=Breaking, 2-3=Hero, 4-6=Top Stories, etc. (see `lib/homepage-positions.ts`)
- Splash animation only shows on initial page load
- Skeleton placeholders appear when `article.imageUrl` is null or empty
