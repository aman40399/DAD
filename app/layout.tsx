import type { Metadata } from 'next'
import { Source_Serif_4, Inter, JetBrains_Mono } from 'next/font/google'
import AnalyticsTracker from '@/components/meridian/AnalyticsTracker'
import NotificationPrompt from '@/components/meridian/NotificationPrompt'
import MobileBottomNav from '@/components/meridian/MobileBottomNav'
import Script from 'next/script'
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
    ...(process.env.GOOGLE_SITE_VERIFICATION && process.env.GOOGLE_SITE_VERIFICATION !== 'YOUR_GOOGLE_VERIFICATION_CODE'
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || 'c7f5399d8b314959a9041a996efefd39',
      'google-adsense-account': 'ca-pub-7763678114241724',
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

  const siteNavigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Singh Monster Main Navigation',
    'itemListElement': [
      {
        '@type': 'SiteNavigationElement',
        'position': 1,
        'name': 'World News',
        'description': 'Global geopolitical developments, diplomatic summits, and breaking international headlines.',
        'url': `${baseUrl}/section/world`,
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 2,
        'name': 'India & Domestic Affairs',
        'description': 'National policy, Supreme Court verdicts, elections, and investigative state reporting.',
        'url': `${baseUrl}/section/india`,
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 3,
        'name': 'Economy & Markets',
        'description': 'Fiscal policy, RBI directives, capital markets, and corporate governance investigations.',
        'url': `${baseUrl}/section/economy`,
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 4,
        'name': 'Technology & AI',
        'description': 'Deep coverage of artificial intelligence, semiconductors, telecom infrastructure, and cybersecurity.',
        'url': `${baseUrl}/section/technology`,
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 5,
        'name': 'Politics & Governance',
        'description': 'Political strategy, cabinet decisions, legislative debates, and constitutional analysis.',
        'url': `${baseUrl}/section/politics`,
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 6,
        'name': 'Environment & Climate',
        'description': 'Ecological research, renewable energy, climate policy, and environmental conservation.',
        'url': `${baseUrl}/section/environment`,
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 7,
        'name': 'About Us',
        'description': 'The editorial mission, standards, and founding background of Singh Monster.',
        'url': `${baseUrl}/about`,
      },
      {
        '@type': 'SiteNavigationElement',
        'position': 8,
        'name': 'Contact Newsroom',
        'description': 'Get in touch with the editorial desk, submit investigative tips, or contact our grievance officer.',
        'url': `${baseUrl}/contact`,
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#8a5e1f" />
        {/* Favicon & Web App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationSchema) }}
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
        {/* Google AdSense Site Verification & Ad Script */}
        <meta name="google-adsense-account" content="ca-pub-7763678114241724" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7763678114241724"
          crossOrigin="anonymous"
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


