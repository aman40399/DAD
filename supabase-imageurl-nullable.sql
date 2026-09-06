-- ============================================
-- MIGRATION: Make image_url column nullable
-- ============================================
-- Execute this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- Make image_url column nullable to allow articles without images
ALTER TABLE articles 
ALTER COLUMN image_url DROP NOT NULL;

-- Verification: Check the column is now nullable
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'articles' AND column_name = 'image_url';

