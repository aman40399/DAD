-- Fix Storage Bucket RLS Policies for Image Upload

-- Create the article-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Also ensure 'images' bucket exists (legacy support)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop ALL existing policies (including any duplicates)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
    DROP POLICY IF EXISTS "Public can view article images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can upload article images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can update article images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can delete article images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Allow public read access to both buckets
CREATE POLICY "Public can view article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images' OR bucket_id = 'images');

-- Allow anyone to upload images to both buckets
CREATE POLICY "Anyone can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' OR bucket_id = 'images');

-- Allow anyone to update images in both buckets
CREATE POLICY "Anyone can update article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' OR bucket_id = 'images');

-- Allow anyone to delete images from both buckets
CREATE POLICY "Anyone can delete article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' OR bucket_id = 'images');
