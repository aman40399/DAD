-- Add language column to articles table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

-- Add language column with default value 'english'
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
