'use client'

import { Article } from '@/types'

interface OrganizationSchemaProps {
  url: string
}

export function OrganizationSchema({ url }: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Chhkwa',
    alternateName: 'तरक्की को चाहिए नया नज़रिया',
    url: url,
    logo: {
      '@type': 'ImageObject',
      url: `${url}/LOGO.png`,
      width: 600,
      height: 60
    },
    description: 'Chhkwa.com is a digital platform dedicated to bringing thoughtful analysis, fresh perspectives, and meaningful conversations on topics that shape our world.',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Editorial',
      email: 'contact@chhkwa.com'
    },
    sameAs: [
      'https://twitter.com/chhkwa',
      'https://facebook.com/chhkwa',
      'https://instagram.com/chhkwa',
      'https://linkedin.com/company/chhkwa'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface ArticleSchemaProps {
  article: Article
  url: string
}

export function ArticleSchema({ article, url }: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl || `${url}/og-image.jpg`,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'Dhananjay Singh',
      url: `${url}/author/${article.author?.toLowerCase().replace(/\s+/g, '-') || 'dhananjay-singh'}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Chhkwa',
      logo: {
        '@type': 'ImageObject',
        url: `${url}/LOGO.png`,
        width: 600,
        height: 60
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${url}/article/${article.slug}`
    },
    articleSection: article.category,
    keywords: article.tags?.join(', ') || article.category,
    inLanguage: 'en-US'
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface WebsiteSchemaProps {
  url: string
}

export function WebsiteSchema({ url }: WebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Chhkwa',
    url: url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
