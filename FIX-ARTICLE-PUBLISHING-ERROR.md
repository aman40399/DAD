# Fix for Article Publishing Error (500)

## Problem
When creating or updating articles, you're getting a 500 error because the `language` field is missing from the database.

## Solution - Run this SQL in Supabase

### Step 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run This SQL Command

```sql
-- Add language column to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language);

-- Update existing articles to have 'english' as language
UPDATE articles 
SET language = 'english' 
WHERE language IS NULL;

-- Add comment to column
COMMENT ON COLUMN articles.language IS 'Article language: english or hindi';
```

### Step 3: Click **Run** button

That's it! The language column will be added to your articles table.

## What This Fixes

✅ Article creation will work (no more 500 error)
✅ Article editing will work
✅ Language field will be saved ('english' or 'hindi')
✅ AI translation feature will work
✅ Existing articles will default to 'english'

## Verify It Works

After running the SQL:
1. Go to `/admin/articles/new`
2. Create a test article
3. Should save successfully without 500 error
4. Check the article in Supabase - should have `language` column

---

## Alternative: If you prefer Supabase UI

1. Go to **Table Editor**
2. Select **articles** table
3. Click **+ New Column**
4. Settings:
   - Name: `language`
   - Type: `text`
   - Default Value: `english`
5. Click **Save**

---

## What Changed in Code

- Added `language` field to Article and DbArticle types
- Updated `createArticle()` to accept language parameter
- Updated `updateArticle()` to handle language updates
- Updated API route to process language field
- All set to default 'english' if not provided

Your app is now ready for bilingual content! 🎉
