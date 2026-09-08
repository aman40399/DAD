-- Initial Schema for Singh Monster on Cloudflare D1

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Dhananjay Singh',
  category TEXT NOT NULL DEFAULT 'World',
  image_url TEXT,
  image_caption TEXT,
  video_url TEXT,
  featured BOOLEAN DEFAULT 0,
  is_breaking BOOLEAN DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  homepage_position INTEGER,
  tags TEXT DEFAULT '[]',
  language TEXT DEFAULT 'english',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  expiration_time INTEGER,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  platform TEXT,
  subscribed_at TEXT NOT NULL,
  last_notified_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_push_endpoint ON push_subscriptions(endpoint);

CREATE TABLE IF NOT EXISTS visitor_analytics (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON visitor_analytics(timestamp DESC);
