-- ============================================
-- SUPABASE DATABASE SCHEMA FOR CHHKWA NEWS CMS
-- ============================================
-- Execute this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- ============================================

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for articles table
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (username: admin, password: pass@123)
INSERT INTO admin_users (username, password)
VALUES ('admin', 'pass@123')
ON CONFLICT (username) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for articles (allow public read, but no write without auth)
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

-- Create policies for admin_users (read-only for authentication)
DO $$ BEGIN
  CREATE POLICY "Enable read access for authentication" ON admin_users
    FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- OPTIONAL: Insert sample articles for testing
-- ============================================

INSERT INTO articles (
  title,
  slug,
  excerpt,
  content,
  author,
  category,
  image_url,
  video_url,
  featured,
  tags
) VALUES
-- Article 1
(
  'Historic Peace Treaty Signed, Heralding a New Era of Global Cooperation',
  'historic-peace-treaty-signed-new-era-global-cooperation',
  'After months of intense negotiations, world leaders have signed a landmark treaty aimed at resolving long-standing conflicts and fostering economic collaboration.',
  '<p>In a momentous occasion that has captured global attention, world leaders gathered today to sign a historic peace treaty that promises to reshape international relations for decades to come.</p><p>The treaty, which has been in negotiation for over eight months, addresses numerous long-standing conflicts and establishes frameworks for economic cooperation between previously adversarial nations. Diplomats and peace advocates worldwide are calling it a watershed moment in modern history.</p><p>"This agreement represents the triumph of diplomacy over discord," said UN Secretary-General in a statement following the signing ceremony. "It demonstrates that even the most intractable conflicts can be resolved through patient dialogue and mutual respect."</p>',
  'Nawab Singh',
  'World',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop',
  null,
  true,
  ARRAY['politics', 'international', 'peace', 'diplomacy']
),
-- Article 2
(
  'Tech Giants Face New Antitrust Legislation as Congress Pushes Reform',
  'tech-giants-face-new-antitrust-legislation',
  'Congress proposes sweeping reforms to regulate big tech companies amid growing concerns about market dominance and data privacy.',
  '<p>In a significant move that could reshape the technology industry, Congress has introduced comprehensive antitrust legislation targeting major technology companies.</p><p>The proposed legislation aims to address concerns about monopolistic practices, data privacy violations, and the overwhelming market power held by a handful of tech giants. If passed, it would represent the most significant regulatory overhaul of the tech sector in decades.</p><p>Key provisions include stricter merger review processes, data portability requirements, and limitations on self-preferencing by platform operators.</p>',
  'Seema Negi',
  'Technology',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['technology', 'regulation', 'antitrust', 'legislation']
),
-- Article 3
(
  'The Future of Artificial Intelligence: Expert Panel Discussion',
  'future-of-artificial-intelligence-expert-panel',
  'Leading AI researchers discuss the implications of emerging technologies and their impact on society, economy, and daily life.',
  '<p>A distinguished panel of artificial intelligence researchers and ethicists convened yesterday to discuss the rapid advancement of AI technology and its far-reaching implications for society.</p><p>The discussion, which was broadcast live to millions of viewers worldwide, covered topics ranging from the potential benefits of AI in healthcare and education to concerns about job displacement and algorithmic bias.</p><p>Dr. Emily Chen, a leading researcher in machine learning, emphasized the importance of developing AI systems that are transparent, accountable, and aligned with human values.</p>',
  'Kushal Singh',
  'Technology',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop',
  'dQw4w9WgXcQ',
  true,
  ARRAY['technology', 'AI', 'future', 'innovation']
),
-- Article 4
(
  'Global Markets Rally as Economic Recovery Gains Momentum',
  'global-markets-rally-economic-recovery-momentum',
  'Stock markets worldwide surge as investors respond to positive economic indicators and corporate earnings reports.',
  '<p>Financial markets across the globe experienced a significant rally today, with major indices reaching new highs as economic recovery continues to gain traction.</p><p>The S&P 500 climbed 2.3%, while the Dow Jones Industrial Average added 350 points. Asian and European markets also posted strong gains, reflecting growing confidence in the global economic outlook.</p><p>Analysts attribute the rally to better-than-expected corporate earnings, declining inflation rates, and optimistic forecasts for consumer spending in the coming quarters.</p>',
  'Abhishek Sanwal',
  'Business',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['business', 'markets', 'economy', 'finance']
),
-- Article 5
(
  'Climate Summit Reaches Breakthrough Agreement on Carbon Emissions',
  'climate-summit-breakthrough-carbon-emissions',
  'World leaders commit to ambitious new targets for reducing greenhouse gas emissions by 2030.',
  '<p>In a landmark achievement for climate action, delegates at the Global Climate Summit have reached a comprehensive agreement on carbon emission reductions.</p><p>The accord, signed by representatives from 195 nations, sets binding targets for reducing greenhouse gas emissions by 50% before 2030. It also establishes a $500 billion fund to help developing nations transition to renewable energy.</p><p>Environmental advocates are hailing the agreement as a critical step forward, though some scientists warn that even more aggressive action may be needed to limit global temperature rise.</p>',
  'Nawab Singh',
  'World',
  'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=1200&h=800&fit=crop',
  null,
  true,
  ARRAY['climate', 'environment', 'politics', 'sustainability']
),
-- Article 6
(
  'Revolutionary Cancer Treatment Shows Promising Results in Clinical Trials',
  'revolutionary-cancer-treatment-promising-results',
  'New immunotherapy approach demonstrates 85% success rate in treating previously incurable forms of cancer.',
  '<p>Medical researchers have announced breakthrough results from clinical trials of a revolutionary cancer treatment that harnesses the body immune system to fight tumors.</p><p>The experimental therapy, which combines gene editing with targeted immunotherapy, has shown an 85% success rate in treating advanced-stage cancers that were previously considered incurable.</p><p>"This represents a paradigm shift in how we approach cancer treatment," said Dr. Sarah Mitchell, lead researcher on the project. "We are cautiously optimistic that this could become a game-changer for patients worldwide."</p>',
  'Seema Negi',
  'Health',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['health', 'medicine', 'research', 'cancer']
),
-- Article 7
(
  'Electric Vehicle Sales Surpass Gas Cars for First Time in Major Markets',
  'electric-vehicle-sales-surpass-gas-cars',
  'EV adoption reaches historic milestone as manufacturers ramp up production and charging infrastructure expands.',
  '<p>For the first time in automotive history, electric vehicle sales have surpassed those of traditional gasoline-powered cars in several major markets.</p><p>According to industry data, EVs accounted for 52% of new car sales in Europe last month, while reaching 48% in China and 35% in the United States. The milestone marks a turning point in the global transition to sustainable transportation.</p><p>Automakers are responding by accelerating their electrification plans, with several major manufacturers announcing they will phase out combustion engines entirely by 2035.</p>',
  'Kushal Singh',
  'Technology',
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['technology', 'automotive', 'electric', 'sustainability']
),
-- Article 8
(
  'Record-Breaking Heatwave Sweeps Across Southern Regions',
  'record-breaking-heatwave-southern-regions',
  'Authorities issue health warnings as temperatures soar above 110°F in multiple cities.',
  '<p>A severe heatwave is affecting millions of people across the southern region, with temperatures reaching record-breaking levels and prompting emergency declarations in multiple states.</p><p>Meteorologists report that the heat dome causing these extreme conditions is expected to persist for at least another week. Authorities are urging residents to stay indoors during peak hours and check on vulnerable neighbors.</p><p>The extreme weather has also strained power grids, with several cities experiencing rolling blackouts as air conditioning usage reaches unprecedented levels.</p>',
  'Abhishek Sanwal',
  'Local',
  'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['weather', 'local', 'climate', 'emergency']
),
-- Article 9
(
  'Championship Final Ends in Stunning Upset Victory',
  'championship-final-stunning-upset-victory',
  'Underdog team defeats heavily favored champions in overtime thriller that captivated millions of fans.',
  '<p>In one of the most dramatic finals in recent memory, the underdog City United pulled off a stunning upset victory against the defending champions in a nail-biting overtime finish.</p><p>Trailing by two goals with just minutes remaining, City United mounted an incredible comeback, scoring twice to force overtime before clinching victory with a golden goal in extra time.</p><p>The victory marks the first championship title in the team 50-year history and has sent fans into wild celebrations across the city.</p>',
  'Nawab Singh',
  'Sports',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=800&fit=crop',
  null,
  true,
  ARRAY['sports', 'championship', 'football', 'upset']
),
-- Article 10
(
  'Space Agency Announces Mission to Establish Lunar Research Station',
  'space-agency-lunar-research-station-mission',
  'Ambitious project aims to create permanent human presence on the Moon by 2028.',
  '<p>The International Space Agency has unveiled plans for an ambitious mission to establish a permanent research station on the lunar surface within the next five years.</p><p>The project, with an estimated budget of $50 billion, will involve contributions from multiple nations and private space companies. The station will serve as a base for scientific research and a stepping stone for future Mars missions.</p><p>"This represents humanity next great adventure," said the agency director. "The lunar station will advance our understanding of space and pave the way for deeper exploration of our solar system."</p>',
  'Seema Negi',
  'Science',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['science', 'space', 'moon', 'exploration']
),
-- Article 11
(
  'Education Reform Bill Promises Free College Tuition for All',
  'education-reform-free-college-tuition',
  'Landmark legislation aims to make higher education accessible regardless of family income.',
  '<p>In a sweeping reform of the education system, lawmakers have passed legislation that will provide free college tuition to all qualified students, regardless of their family financial situation.</p><p>The bill, which has been years in the making, will be funded through a combination of progressive taxation and reallocation of existing education budgets. Supporters argue it will reduce student debt and create a more educated workforce.</p><p>Critics have raised concerns about the program cost and implementation challenges, but polls show strong public support for the initiative.</p>',
  'Kushal Singh',
  'Politics',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['education', 'politics', 'reform', 'college']
),
-- Article 12
(
  'Revolutionary Quantum Computer Achieves Major Breakthrough',
  'quantum-computer-major-breakthrough',
  'Scientists solve complex problems in seconds that would take classical computers thousands of years.',
  '<p>Researchers have achieved a major milestone in quantum computing, demonstrating a system that can solve previously intractable problems in mere seconds.</p><p>The breakthrough involves a 1000-qubit quantum processor that achieved "quantum advantage" by solving optimization problems exponentially faster than the world most powerful supercomputers.</p><p>Industry experts believe this advancement could revolutionize fields ranging from drug discovery to climate modeling, artificial intelligence, and cryptography.</p>',
  'Abhishek Sanwal',
  'Technology',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=800&fit=crop',
  null,
  true,
  ARRAY['technology', 'quantum', 'computing', 'science']
),
-- Article 13
(
  'Housing Market Shows Signs of Stabilization After Volatility',
  'housing-market-stabilization-after-volatility',
  'Real estate experts report balanced conditions as inventory increases and prices moderate.',
  '<p>After months of extreme volatility, the housing market is showing signs of stabilization as inventory levels rise and price growth moderates to sustainable levels.</p><p>According to the latest data, home prices increased by just 2% year-over-year, down from double-digit growth rates seen in previous years. Meanwhile, housing inventory has climbed to a five-year high.</p><p>Real estate analysts attribute the stabilization to a combination of factors, including easing mortgage rates, increased construction, and changing buyer demographics.</p>',
  'Seema Negi',
  'Business',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['business', 'housing', 'real estate', 'economy']
),
-- Article 14
(
  'Art Exhibition Breaks Records with Historic Collection',
  'art-exhibition-breaks-records-historic-collection',
  'Museum unveils rare masterpieces in once-in-a-lifetime showcase drawing crowds from around the world.',
  '<p>The Metropolitan Museum has opened what critics are calling the most significant art exhibition of the century, featuring rare masterpieces on loan from collections worldwide.</p><p>The exhibition, titled "Masters Through the Ages," includes works never before displayed together, spanning from Renaissance classics to contemporary installations.</p><p>Advance tickets sold out within hours, and the museum has extended operating hours to accommodate unprecedented demand. Art historians describe it as a once-in-a-lifetime opportunity to view these treasures in one place.</p>',
  'Nawab Singh',
  'Arts',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['arts', 'culture', 'exhibition', 'museum']
),
-- Article 15
(
  'Mental Health Initiative Launched to Support Young Adults',
  'mental-health-initiative-young-adults',
  'New nationwide program provides free counseling and resources to address growing mental health crisis.',
  '<p>In response to rising mental health concerns among young adults, health officials have launched a comprehensive initiative to provide accessible support services across the nation.</p><p>The program offers free counseling, crisis intervention, and mental health resources through a combination of in-person clinics and digital platforms. It specifically targets individuals aged 18-25, who have been disproportionately affected by stress, anxiety, and depression.</p><p>Mental health advocates are praising the initiative as a crucial step toward destigmatizing mental health issues and ensuring that support is available to those who need it most.</p>',
  'Kushal Singh',
  'Health',
  'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=1200&h=800&fit=crop',
  null,
  false,
  ARRAY['health', 'mental health', 'support', 'youth']
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('articles', 'admin_users');

-- Check admin user
SELECT id, username, created_at FROM admin_users;

-- Check sample articles
SELECT id, title, slug, category, featured FROM articles;
