# Chhkwa News - Admin CMS Setup Guide

A modern news website with a complete Content Management System built with Next.js, Supabase, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Git

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database (IMPORTANT - DO THIS FIRST!)

Before you can use the admin panel, you MUST set up the database:

1. Go to your Supabase dashboard: https://sgnqnllnnhhrzvdwwktz.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste into the SQL editor
6. Click **Run** to execute the SQL

This will create:
- `articles` table for storing all your news articles
- `admin_users` table with your admin credentials
- Required indexes for performance
- Sample data to get you started

### 3. Environment Variables

Your `.env.local` file is already configured with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sgnqnllnnhhrzvdwwktz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your website!

## 🔐 Admin Access

### Login Credentials
- **URL**: http://localhost:3000/admin
- **Username**: `admin`
- **Password**: `pass@123`

### Admin Features

1. **Dashboard** (`/admin/dashboard`)
   - View all articles in a table
   - See article status, category, author, and published date
   - Quick actions: View, Edit, Delete

2. **Create Article** (`/admin/articles/new`)
   - Rich form with all fields
   - Auto-generates slug from title
   - Support for images and YouTube videos
   - Tags and featured article option

3. **Edit Article** (`/admin/articles/[id]/edit`)
   - Pre-populated form with existing data
   - Update any field
   - Save changes instantly

## 📝 Creating Your First Article

1. Login to admin panel
2. Click **"+ New Article"** button
3. Fill in the required fields:
   - **Title** (required) - Auto-generates URL slug
   - **Content** (required) - Main article text (supports HTML)
   - **Author** - Select from dropdown
   - **Category** - Choose article category
   - **Excerpt** - Brief summary (optional but recommended)
   - **Image URL** - Hero image for the article
   - **YouTube URL** - Embed a video (optional)
   - **Tags** - Comma-separated keywords
   - **Featured** - Check to show on homepage hero

4. Click **"Publish Article"**
5. Your article is now live!

## 🎨 Website Structure

### Public Pages

- **Homepage** (`/`) - Dynamic sections showing latest articles from each category
- **Article Detail** (`/article/[slug]`) - Full article with related stories
- **Section Pages** (`/section/[slug]`) - Category-specific article listings
- **Author Pages** (`/author/[name]`) - Articles by specific author
- **About** (`/about`) - About the publication

### Sections Available
- World
- Technology
- Business
- Local
- Sports
- Opinion
- Arts
- Science
- Health
- Politics

## 🎯 Content Guidelines

### Article Images
- Use high-quality images (1200x800 recommended)
- URLs must be publicly accessible
- Images automatically apply grayscale filter (NYT style)

### YouTube Videos
- Paste full YouTube URL or just the video ID
- Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` or `dQw4w9WgXcQ`

### Content Formatting
Your articles support HTML tags:
- `<p>` - Paragraphs
- `<strong>` - Bold text
- `<em>` - Italic text
- `<h2>`, `<h3>` - Subheadings
- `<ul>`, `<ol>`, `<li>` - Lists
- `<a href="">` - Links

### Example Article Content
```html
<p>This is the first paragraph of your article.</p>

<h2>This is a Subheading</h2>

<p>Here's another paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>

<ul>
  <li>List item 1</li>
  <li>List item 2</li>
  <li>List item 3</li>
</ul>

<p>You can also add <a href="https://example.com">links to external sites</a>.</p>
```

## 🔧 Configuration

### Authors
Edit the `AUTHORS` array in:
- `app/admin/articles/new/page.tsx`
- `app/admin/articles/[id]/edit/page.tsx`

### Categories
Edit the `CATEGORIES` array in the same files to add/remove categories.

### Site Branding
- Update `Header.tsx` for logo and site name
- Modify `Footer.tsx` for footer content
- Change fonts in `app/layout.tsx`

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Important Notes
- Articles are cached for 60 seconds (ISR)
- Database runs on Supabase's free tier
- Admin session expires after 7 days

## 🔍 Database Schema

### Articles Table
```sql
- id (UUID, primary key)
- title (text)
- slug (text, unique)
- excerpt (text)
- content (text)
- author (text)
- category (text)
- image_url (text)
- video_url (text)
- featured (boolean)
- published_at (timestamp)
- tags (text array)
- created_at (timestamp)
- updated_at (timestamp)
```

### Admin Users Table
```sql
- id (serial, primary key)
- username (text, unique)
- password (text)
- created_at (timestamp)
```

## 🆘 Troubleshooting

### "No articles showing on homepage"
- Make sure you ran the SQL schema in Supabase
- Check that articles exist in the database
- Verify environment variables are correct

### "Cannot login to admin"
- Ensure SQL schema was executed (creates admin user)
- Check username: `admin`, password: `pass@123`
- Clear browser cookies and try again

### "Images not loading"
- Verify image URLs are publicly accessible
- Check for CORS issues
- Try using Unsplash or Imgur for image hosting

### "Error creating article"
- Check browser console for specific error
- Verify all required fields are filled
- Ensure Supabase connection is working

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Fonts**: Playfair Display, Merriweather, Roboto
- **Authentication**: Session-based with httpOnly cookies

## 🎨 Design Philosophy

This site follows The New York Times design principles:
- Clean, readable typography
- High-contrast black and white theme
- Grayscale images for sophistication
- Strong hierarchical structure
- Focus on content readability

## 📧 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments for guidance
3. Check Supabase dashboard for database status

---

**Built with ❤️ for modern journalism**
