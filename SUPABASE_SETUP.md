# 🚀 Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a new account
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: Chhkwa News CMS
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project"
6. Wait 2-3 minutes for project initialization

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on "Settings" (gear icon in left sidebar)
2. Click on "API" in the settings menu
3. You'll see two important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
4. Copy these values - you'll need them next!

## Step 3: Configure Environment Variables

1. In your project folder `/home/aman/Desktop/DAD/`, create a file named `.env.local`
2. Add the following content (replace with your actual values):

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

3. Save the file

## Step 4: Create Database Tables

1. In your Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the SQL code from that file
5. Paste it into the SQL Editor
6. Click "Run" button (or press Ctrl+Enter)
7. You should see "Success. No rows returned" message

## Step 5: Verify Database Setup

1. Click on "Table Editor" in the left sidebar
2. You should see two tables:
   - **articles** (with 3 sample articles)
   - **admin_users** (with 1 admin user)
3. Click on each table to verify the data

## Step 6: Test the Connection

1. Restart your Next.js development server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. The app should now connect to Supabase successfully!

## 🔑 Admin Login Credentials

- **Username**: admin
- **Password**: pass@123

You can use these to login to the admin panel once it's built.

## 📊 What's Created in Supabase

### Tables:

1. **admin_users**
   - id (UUID)
   - username (Text)
   - password (Text)
   - created_at (Timestamp)

2. **articles**
   - id (UUID)
   - title (Text)
   - slug (Text, unique)
   - excerpt (Text)
   - content (Text, full HTML content)
   - author (Text)
   - category (Text)
   - image_url (Text)
   - video_url (Text, optional)
   - featured (Boolean)
   - tags (Text Array)
   - created_at (Timestamp)
   - updated_at (Timestamp)
   - published_at (Timestamp)

### Indexes:
- slug (for fast lookups)
- category (for filtering)
- featured (for homepage)
- published_at (for sorting)

### Security:
- Row Level Security (RLS) enabled
- Public read access for articles
- Authenticated write access only

## 🔒 Security Notes

For production, you should:
1. Hash passwords using bcrypt
2. Implement proper authentication with JWT
3. Use Supabase Auth instead of custom admin table
4. Add more granular RLS policies
5. Enable rate limiting

## 🐛 Troubleshooting

**Error: "Missing Supabase environment variables"**
- Make sure `.env.local` file exists
- Check that variable names match exactly
- Restart the dev server after creating `.env.local`

**Error: "relation 'articles' does not exist"**
- Run the SQL schema in Supabase SQL Editor
- Verify tables exist in Table Editor

**Error: "Failed to fetch articles"**
- Check your Supabase URL and API key
- Verify RLS policies are set correctly
- Check browser console for detailed errors

## ✅ Next Steps

Once Supabase is configured:
1. The admin panel will be created
2. Article editor will be built
3. Dynamic article pages will work
4. Landing page will fetch real data from Supabase

---

**Need help?** Check the Supabase documentation at [https://supabase.com/docs](https://supabase.com/docs)
