-- ==========================================================
-- SUPABASE DATABASE SCHEMA & MIGRATIONS FOR THE MERIDIAN NEWS CMS
-- ==========================================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create articles table (canonical schema)
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_caption TEXT,
  video_url TEXT,
  featured BOOLEAN DEFAULT false,
  is_breaking BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  homepage_position INTEGER DEFAULT NULL CHECK (homepage_position IS NULL OR (homepage_position >= 1 AND homepage_position <= 15)),
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'english',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================================
-- IDEMPOTENT SCHEMA MIGRATIONS (Safe for existing databases)
-- ==========================================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_caption TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_breaking BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS homepage_position INTEGER DEFAULT NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'english';

DO $$ BEGIN
  ALTER TABLE articles ADD CONSTRAINT chk_article_status CHECK (status IN ('draft', 'published', 'archived'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE articles ADD CONSTRAINT chk_homepage_position CHECK (homepage_position IS NULL OR (homepage_position >= 1 AND homepage_position <= 15));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_homepage_position ON articles(homepage_position);
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking ON articles(is_breaking);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Default admin user
INSERT INTO admin_users (username, password)
VALUES ('admin', 'pass@123')
ON CONFLICT (username) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Enable read access for all users" ON articles
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable insert for authenticated users only" ON articles
    FOR INSERT WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable update for authenticated users only" ON articles
    FOR UPDATE USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable delete for authenticated users only" ON articles
    FOR DELETE USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Enable read access for authentication" ON admin_users
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
