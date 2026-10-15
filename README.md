<div align="center">

# 📰 Singh Monster // Editorial News Platform

### High-Performance Digital Journalism, Editorial CMS & Real-Time Search Indexing Engine

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38b2ac?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS S3](https://img.shields.io/badge/Storage-AWS_S3-FF9900?style=for-the-badge&logo=amazon-s3&logoColor=white)](https://aws.amazon.com/s3/)
[![WebPush](https://img.shields.io/badge/Push_Notifications-Web--Push-blueviolet?style=for-the-badge&logo=google-chrome&logoColor=white)](https://web.dev/push-notifications-overview/)

---

*“Sharp reporting. Deep analysis. No agenda but the truth.”*

**Singh Monster** is a production-grade, photography-first digital news publication and editorial content management platform. Built on the Next.js 14 App Router, it provides high-speed server rendering, dynamic Google News & Indexing API integrations, WebSub real-time crawler pings, and rich multimedia article authoring.

</div>

---

## 🌟 Key Features

### 🖋️ 1. Editorial CMS & Article Studio
- **Rich-Text & Markdown Authoring**: Full-featured article editor supporting Quill, Markdown parsing, and sanitized HTML embeds.
- **Editorial Categorization**: Structured sections spanning World Affairs, Politics, Business & Economy, Technology & 6G, Culture, and Investigative Commentary.
- **Author Bylines & Verified Columns**: Dedicated author profile pages with biographical schema, published story feeds, and social verification.
- **Institutional Compliance**: Built-in institutional pages including Editorial Guidelines, Ethics Code, Fact-Checking Standards, and Corrections Policy.

### ⚡ 2. Instant Search Indexing & Advanced SEO
- **Google Indexing API**: Instant automated pinging on article publication and revision for rapid search engine discovery.
- **WebSub / PubSubHubbub Integration**: Real-time push notifications to search engine subscriber hubs immediately upon article release.
- **Google News Sitemap**: Compliant XML sitemap (`/sitemap-news.xml`) adhering to Google News Publisher Center requirements.
- **Structured JSON-LD**: Comprehensive rich snippets including `NewsArticle`, `BreadcrumbList`, and `SiteNavigationElement`.
- **Editorial Feeds**: Fully syndicated RSS 2.0 (`/rss.xml`) and Atom feeds (`/feed.xml`).

### 📱 3. Reader Experience & Mobile Optimization
- **Photography-First Layout**: High-impact editorial imagery with negative letter-spacing typography (Apple SF Pro Display / Source Serif 4).
- **Web Push Notifications**: Push subscription prompts and VAPID-based push notifications for breaking alerts.
- **Mobile Bottom Navigation**: Distraction-free mobile layout with quick section jumping, search, and reading-mode controls.
- **Live Search**: Instant keyword-based article lookup and filtering across archival stories.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Reader["Reader (Mobile / Desktop)"]
    NextServer["Next.js 14 App Router Server"]
    S3Storage["AWS S3 / R2 Asset Bucket"]
    GoogleEngine["Google Indexing API & WebSub Hubs"]
    PushService["Web Push Notifications (VAPID)"]
    Admin["Editorial Newsroom (Staff / Author)"]

    Admin -->|Draft & Publish Article| NextServer
    NextServer -->|Store Media & Images| S3Storage
    NextServer -->|Instant Discovery Ping| GoogleEngine
    NextServer -->|Dispatch Breaking Alerts| PushService
    Reader -->|SSR & ISR Articles| NextServer
    PushService -->|Receive Push Alerts| Reader
```

---

## 📁 Repository Structure

```
news/
├── app/
│   ├── (editorial)/          # Category, section, article dynamic routes
│   ├── admin/                # Editorial dashboard & article management
│   ├── api/                  # API endpoints (indexing, push, articles)
│   ├── author/               # Author profile and directory routes
│   ├── layout.tsx            # Root layout, fonts, and global metadata
│   ├── page.tsx              # Magazine front page & breaking news grid
│   ├── robots.ts             # Search engine crawling policies
│   └── sitemap.ts            # Dynamic XML sitemap generator
├── components/               # Editorial cards, navigations, notification modals
├── lib/                      # Storage client, RSS generators, indexing hooks
├── public/                   # Favicons, brand icons, and static assets
├── types/                    # TypeScript interfaces for articles, categories
├── DESIGN.md                 # Design specifications & Apple aesthetic tokens
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **AWS S3 / Cloudflare R2**: Bucket credentials for image uploads
- **Google Cloud Console**: Service account with Search Console & Indexing API access

---

### 1. Installation

```bash
git clone https://github.com/aman40399/DAD.git
cd DAD
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_BASE_URL=https://www.singh.monster
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:editor@singh.monster

# AWS S3 / Cloudflare R2
AWS_REGION=auto
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=singh-monster-media

# Optional: Google Indexing API Service Account
GOOGLE_INDEXING_CLIENT_EMAIL=your_service_account_email
GOOGLE_INDEXING_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

### 3. Run Locally

```bash
# Start development server
npm run dev

# Production build
npm run build
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
