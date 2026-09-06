# Chhkwa - New York Times Styled News Website

A modern, professional news website built with Next.js 14, React, and Tailwind CSS, featuring a classic New York Times inspired design with full navigation, author pages, and multimedia support.

## ✨ Features

- 🎨 **Professional NYT-Inspired Design**
  - Classic newspaper layout with premium typography
  - Grayscale imagery with hover effects
  - Clean, elegant borders and section dividers
  - Breaking news banner

- 📱 **Fully Responsive Layout**
  - Mobile-first approach
  - Collapsible mobile navigation
  - Adaptive grid layouts
  - Touch-friendly interface

- 🧭 **Complete Navigation System**
  - Sticky header with search functionality
  - Working navigation links
  - Section pages (World, U.S., Politics, Business, Technology, Sports, Arts, Opinion)
  - Mobile hamburger menu

- 👥 **Author System**
  - Dedicated author profile pages
  - Author bio and contact information
  - Article attribution links
  - About Us page with full team

- 🎥 **Multimedia Support**
  - YouTube video embeds
  - Responsive video player
  - Image galleries with captions

- 📰 **Rich Content Sections**
  - Hero/Featured Articles
  - World News
  - Technology (with video)
  - Business
  - Local News
  - Sports
  - Opinion/Editorial
  - Weather

- ⚡ **Performance Optimized**
  - Next.js 14 App Router
  - Static page generation
  - Optimized images
  - Fast page transitions

- 🎯 **TypeScript for Type Safety**
- 💅 **Tailwind CSS for Styling**
- 🌓 **Dark Mode Ready** (infrastructure in place)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

\`\`\`bash
npm install
# or
yarn install
\`\`\`

2. Run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
DAD/
├── app/
│   ├── layout.tsx              # Root layout with fonts
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── about/
│   │   └── page.tsx            # About Us page
│   ├── author/
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic author pages
│   └── section/
│       └── [slug]/
│           └── page.tsx        # Dynamic section pages
├── components/
│   ├── Header.tsx              # Header with navigation
│   ├── Footer.tsx              # Footer component
│   └── YouTubeEmbed.tsx        # Video embed component
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
\`\`\`

## Pages & Routes

### Main Pages
- `/` - Home/Landing page with all sections
- `/about` - About Us page with team information

### Author Pages
- `/author/sarah-mitchell` - Editor-in-Chief
- `/author/james-chen` - Senior Political Correspondent
- `/author/maria-rodriguez` - International News Editor
- `/author/david-thompson` - Technology Reporter

### Section Pages
- `/section/world` - World News
- `/section/us` - U.S. News
- `/section/politics` - Politics
- `/section/business` - Business
- `/section/technology` - Technology
- `/section/sports` - Sports
- `/section/arts` - Arts & Culture
- `/section/opinion` - Opinion/Editorial

## Key Components

### Header
- Sticky navigation bar
- Search functionality
- Mobile responsive menu
- Dynamic date display
- Subscribe/Login buttons

### YouTubeEmbed
Usage:
\`\`\`tsx
<YouTubeEmbed 
  videoId="YOUR_VIDEO_ID" 
  title="Video Title"
  className="mb-4"
/>
\`\`\`

## Customization

### Fonts

The project uses premium typography:
- **Playfair Display**: Headlines and display text
- **Merriweather**: Body text and articles
- **Roboto**: UI elements and captions

### Colors

Customize theme colors in \`tailwind.config.js\`:

\`\`\`javascript
colors: {
  primary: '#000000',
  'background-light': '#ffffff',
  'background-dark': '#1a1a1a',
}
\`\`\`

### Adding New Authors

Edit \`app/author/[slug]/page.tsx\` to add new author profiles in the \`authors\` object.

### Adding New Sections

Add new section routes in \`app/section/[slug]/page.tsx\` in the \`sections\` object.

## Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Features in Detail

### Navigation
- Fully functional with Next.js Link components
- Smooth client-side transitions
- Active state indicators
- Breadcrumb support

### SEO Ready
- Proper meta tags
- Semantic HTML structure
- Descriptive headings
- Alt text for images

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader friendly
- Focus indicators

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Article detail pages
- [ ] Comment system
- [ ] Newsletter subscription
- [ ] Advanced search
- [ ] Related articles
- [ ] Social sharing
- [ ] Reading time estimates
- [ ] Bookmark functionality

## License

MIT License
