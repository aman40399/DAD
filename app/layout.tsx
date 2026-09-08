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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Singh Monster — Sharp reporting. Deep analysis. No agenda but the truth.',
    template: '%s | Singh Monster',
  },
  description: 'Singh Monster — Sharp reporting. Deep analysis. No agenda but the truth. Discover world news, politics, business, technology, sports, and investigative reporting led by Dhananjay Singh.',
  keywords: ['Singh Monster', 'Dhananjay Singh', 'News', 'Investigative Journalism', 'India', 'World Affairs', 'Economy', 'Technology'],
  authors: [{ name: 'Dhananjay Singh' }],
  creator: 'Dhananjay Singh',
  publisher: 'Singh Monster',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
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
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#8a5e1f" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
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

