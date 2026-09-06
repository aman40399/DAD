'use client'

export default function SkeletonArticle({ variant = 'card' }: { variant?: 'card' | 'list' }) {
  if (variant === 'card') {
    return (
      <div className="animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-sm p-4">
        <div className="h-40 bg-neutral-200 dark:bg-neutral-700 rounded mb-3"></div>
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2 w-1/2"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
      </div>
    )
  }

  return (
    <div className="animate-pulse flex gap-4 items-center p-3 bg-neutral-100 dark:bg-neutral-800 rounded-sm">
      <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
      <div className="flex-1">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2 w-1/2"></div>
        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
      </div>
    </div>
  )
}
