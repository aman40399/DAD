import type { Metadata } from 'next'
import { Merriweather, Roboto, Playfair_Display } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/AuthProvider'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData'
import { WebVitalsReporter } from '@/components/WebVitalsReporter'
import { Suspense } from 'react'

const merriweather = Merriweather({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  preload: true,
})

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  preload: true,
})

const playfair = Playfair_Display({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Chhkwa - Breaking News, Analysis & Expert Opinions | तरक्की को चाहिए नया नज़रिया',
    template: '%s | Chhkwa - Latest News & Analysis'
  },
  description: 'Chhkwa.com - India\'s leading news platform for breaking news, in-depth analysis, and expert opinions on world events, politics, technology, business, sports, and culture. Get comprehensive coverage with fresh perspectives. तरक्की को चाहिए नया नज़रिया - Progress needs a new perspective.',
  keywords: [
    // Brand Keywords
    'chhkwa', 'chhkwa news', 'chhkwa.com', 'chhkwa india', 'chhkwa newspaper',
    'chhkwa media', 'chhkwa portal', 'chhkwa online', 'chhkwa website',
    // News Categories
    'breaking news', 'latest news', 'news today', 'current news', 'live news',
    'world news', 'international news', 'global news', 'india news', 'indian news',
    'politics news', 'political updates', 'government news', 'election news',
    'business news', 'economy news', 'market news', 'finance news', 'stock market',
    'technology news', 'tech updates', 'gadgets news', 'innovation news', 'AI news',
    'sports news', 'cricket news', 'football news', 'sports updates', 'live scores',
    'entertainment news', 'bollywood news', 'hollywood news', 'celebrity news',
    // Hindi Keywords
    'समाचार', 'ताज़ा ख़बरें', 'आज की खबर', 'ब्रेकिंग न्यूज़', 'भारत समाचार',
    'राजनीति समाचार', 'व्यापार समाचार', 'खेल समाचार', 'मनोरंजन समाचार',
    'तरक्की', 'विकास', 'प्रगति', 'नया नज़रिया', 'दृष्टिकोण',
    // Long-tail Keywords
    'investigative journalism', 'fact-based reporting', 'credible news source',
    'daily news updates', 'news portal india', 'online news website',
    'digital journalism', 'news analysis', 'expert opinions', 'current affairs',
    'unbiased news', 'authentic news', 'verified news', 'reliable news source',
    'comprehensive news coverage', 'in-depth analysis', 'breaking news alerts',
    // Location-based
    'india news portal', 'indian news website', 'news from india', 'hindi news',
    'english news india', 'bilingual news', 'indian journalism',
    // Content Types
    'news articles', 'news reports', 'news stories', 'editorials', 'opinion pieces',
    'feature stories', 'investigative reports', 'news blog', 'news magazine'
  ],
  authors: [{ name: 'Dhananjay Singh', url: 'https://chhkwa.com/author/dhananjay-singh' }],
  creator: 'Chhkwa Media',
  publisher: 'Chhkwa',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://chhkwa.com'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: ['hi_IN', 'en_US'],
    url: '/',
    siteName: 'Chhkwa - Breaking News & Analysis',
    title: 'Chhkwa - India\'s Premier News Portal | तरक्की को चाहिए नया नज़रिया',
    description: 'Comprehensive coverage of breaking news, politics, business, technology, sports, and entertainment. India\'s most trusted news source with in-depth analysis and expert opinions.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chhkwa - Progress Needs a New Perspective',
        type: 'image/jpeg',
      },
      {
        url: '/og-image-square.jpg',
        width: 1200,
        height: 1200,
        alt: 'Chhkwa News',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@chhkwa',
    title: 'Chhkwa - Breaking News & Expert Analysis | तरक्की को चाहिए नया नज़रिया',
    description: 'India\'s leading news platform for breaking news, analysis, and perspectives on politics, business, technology, sports, and culture.',
    creator: '@chhkwa',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    // Mobile optimization signals
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Chhkwa',
    // Googlebot smartphone optimization
    'format-detection': 'telephone=no',
    'HandheldFriendly': 'true',
    'MobileOptimized': '375',
    // News-specific
    'news_keywords': 'breaking news, india news, world news, politics, technology, business, sports, analysis',
    'article:publisher': 'https://chhkwa.com',
    'article:author': 'Dhananjay Singh',
    // Rich snippets
    'og:type': 'website',
    'og:site_name': 'Chhkwa',
    // AMP alternative (if you implement AMP)
    // 'amphtml': `${process.env.NEXT_PUBLIC_BASE_URL}/amp`,
  },
  category: 'news',
  classification: 'News Media',
  verification: {
    google: 'your-google-verification-code',
    // Add your verification codes here after setting up:
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return (
    <html lang="en" className="light">
      <head>
        {/* Viewport for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Google AdSense - Async with proper attributes */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2180926216252078"
          crossOrigin="anonymous"
        />
        
        {/* Material Symbols - Optimized with display=swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=swap"
          rel="stylesheet"
        />
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme */}
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Chhkwa" />
        
        {/* Mobile tap highlight */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* Structured Data */}
        <OrganizationSchema url={baseUrl} />
        <WebsiteSchema url={baseUrl} />
      </head>
      <body className={`${merriweather.variable} ${roboto.variable} ${playfair.variable} font-body`}>
        <WebVitalsReporter />
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
