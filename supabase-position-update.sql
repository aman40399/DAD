-- ============================================
-- ADD HOMEPAGE POSITION FIELD TO ARTICLES
-- ============================================
-- Run this SQL in Supabase SQL Editor AFTER running the main schema
-- This adds the position system for homepage layout
-- ============================================

-- Add homepage_position column to articles table
-- Position 0 = not on homepage (archived/old articles)
-- Position 1-20 = specific slots on homepage
-- Position NULL = not assigned yet
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS homepage_position INTEGER DEFAULT NULL;

-- Create unique constraint so only one article can be in each position
-- But allow multiple articles with NULL position (not on homepage)
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_homepage_position_unique 
ON articles(homepage_position) 
WHERE homepage_position IS NOT NULL AND homepage_position > 0;

-- Create index for querying by position
CREATE INDEX IF NOT EXISTS idx_articles_homepage_position 
ON articles(homepage_position) 
WHERE homepage_position IS NOT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN articles.homepage_position IS 
'Homepage layout position (1-20). NULL = not assigned, 0 = archived/old articles not on homepage';

-- Update existing featured articles to have positions 1-20
-- This is just for initial setup - you can adjust these manually
DO $$
DECLARE
  article_record RECORD;
  position_counter INTEGER := 2;
BEGIN
  -- Get featured articles ordered by published date
  FOR article_record IN 
    SELECT id FROM articles 
    WHERE featured = true 
    ORDER BY published_at DESC 
    LIMIT 19
  LOOP
    UPDATE articles 
    SET homepage_position = position_counter 
    WHERE id = article_record.id;
    
    position_counter := position_counter + 1;
    
    EXIT WHEN position_counter > 20;
  END LOOP;
  
  -- Set the most recent featured article as position 1 (breaking news)
  UPDATE articles 
  SET homepage_position = 1 
  WHERE id = (
    SELECT id FROM articles 
    WHERE featured = true 
      AND homepage_position IS NULL 
    ORDER BY published_at DESC 
    LIMIT 1
  );
END $$;

-- Set old articles (not on homepage) to position 0
UPDATE articles 
SET homepage_position = 0 
WHERE homepage_position IS NULL;

-- Show current position assignments
SELECT 
  homepage_position,
  title,
  category,
  published_at
FROM articles
WHERE homepage_position > 0
ORDER BY homepage_position;
