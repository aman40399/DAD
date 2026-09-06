'use client'

import Link from 'next/link'
import { Article } from '@/types'
import { getTimeAgo } from '@/lib/utils'

interface Props {
  articles: Article[]
}

export default function TopStoriesScroll({ articles }: Props) {
  if (articles.length === 0) return null

  return (
    <div className="sticky top-4">
      <h3 className="text-xs font-bold uppercase tracking-wider border-b border-neutral-900 dark:border-neutral-100 pb-2 mb-4">
        Top Stories
      </h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <article 
            key={article.id} 
            className="pb-4 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
          >
            <Link href={`/article/${article.slug}`}>
              <h4 className="font-serif font-bold text-base leading-tight mb-2 hover:text-neutral-600 dark:hover:text-neutral-400">
                {article.title}
              </h4>
            </Link>
            {article.excerpt && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                {article.excerpt}
              </p>
            )}
            <span className="text-xs text-neutral-500 font-sans">
              {getTimeAgo(article.publishedAt)}
            </span>
          </article>
        ))}
      </div>
    </div>
  )
}
