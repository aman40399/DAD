import type { Metadata } from 'next'
import { Source_Serif_4, Inter, JetBrains_Mono } from 'next/font/google'
import AnalyticsTracker from '@/components/meridian/AnalyticsTracker'
import NotificationPrompt from '@/components/meridian/NotificationPrompt'
import MobileBottomNav from '@/components/meridian/MobileBottomNav'
import './globals.css'

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
  preload: true,
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
})

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.singh.monster').replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Singh Monster — Sharp reporting. Deep analysis. No agenda but the truth.',
    template: '%s | Singh Monster',
  },
  description: 'Singh Monster — Sharp reporting. Deep analysis. No agenda but the truth. Discover world news, politics, business, technology, sports, and investigative reporting led by Dhananjay Singh.',
  keywords: [
    'Singh Monster',
    'Dhananjay Singh',
    'News',
    'Investigative Journalism',
    'India',
    'World Affairs',
    'Economy',
    'Technology',
    '6G Telecom',
    'Ballia',
    'Uttar Pradesh',
    'Tech News',
  ],
  authors: [{ name: 'Dhananjay Singh', url: `${baseUrl}/author/dhananjay-singh` }],
  creator: 'Dhananjay Singh',
  publisher: 'Singh Monster',
  category: 'news',
  classification: 'News Publication & Journalistic Commentary',
  alternates: {
    canonical: baseUrl,
    types: {
      'application/rss+xml': [{ url: `${baseUrl}/feed.xml`, title: 'Singh Monster RSS Feed' }],
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['hi_IN'],
    url: baseUrl,
    siteName: 'Singh Monster',
    title: 'Singh Monster — Sharp reporting. Deep analysis. No agenda but the truth.',
    description: 'Sharp reporting. Deep analysis. No agenda but the truth. Investigative journalism and real-time dispatches.',
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Singh Monster',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SinghMonster',
    creator: '@SinghMonster',
    title: 'Singh Monster — Sharp reporting. Deep analysis. No agenda but the truth.',
    description: 'Sharp reporting. Deep analysis. No agenda but the truth. Investigative journalism and real-time dispatches.',
    images: [`${baseUrl}/logo.png`],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || 'YOUR_GOOGLE_VERIFICATION_CODE',
    yandex: process.env.YANDEX_VERIFICATION,
    other: {
      ...(process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : {}),
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    'name': 'Singh Monster',
    'alternateName': ['Singh.monster', 'सिंह मॉन्स्टर'],
    'url': baseUrl,
    'logo': {
      '@type': 'ImageObject',
      'url': `${baseUrl}/logo.png`,
      'width': 512,
      'height': 512,
    },
    'foundingDate': '2026',
    'foundingLocation': {
      '@type': 'Place',
      'name': 'Ballia, Uttar Pradesh, India',
    },
    'founder': {
      '@type': 'Person',
      'name': 'Dhananjay Singh',
      'jobTitle': 'Founder & Editor-in-Chief',
      'url': `${baseUrl}/author/dhananjay-singh`,
      'sameAs': [
        'https://twitter.com/SinghMonster',
        'https://www.linkedin.com/company/singhmonster',
      ],
    },
    'publishingPrinciples': `${baseUrl}/editorial-guidelines`,
    'ethicsPolicy': `${baseUrl}/editorial-guidelines`,
    'correctionsPolicy': `${baseUrl}/corrections`,
    'verificationFactCheckingPolicy': `${baseUrl}/fact-checking`,
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'contactType': 'Editorial Newsroom',
        'email': 'contact@singh.monster',
        'areaServed': ['IN', 'Worldwide'],
        'availableLanguage': ['English', 'Hindi'],
      },
      {
        '@type': 'ContactPoint',
        'contactType': 'Grievance Officer',
        'email': 'grievance@singh.monster',
        'areaServed': 'IN',
        'availableLanguage': ['English', 'Hindi'],
      },
    ],
    'sameAs': [
      'https://twitter.com/SinghMonster',
      'https://www.linkedin.com/company/singhmonster',
    ],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Singh Monster',
    'alternateName': 'Singh.monster',
    'url': baseUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${baseUrl}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#8a5e1f" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pub-f105b5c2551040e1b44a90da84ffa541.r2.dev" />
        <link rel="alternate" type="application/rss+xml" title="Singh Monster RSS 2.0 Feed" href={`${baseUrl}/feed.xml`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable} font-serif bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink antialiased min-h-screen selection:bg-accent selection:text-white`}
      >
        <AnalyticsTracker />
        <NotificationPrompt />
        {children}
        <MobileBottomNav />
      </body>
    </html>
  )
}


