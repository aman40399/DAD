export default function LoadingArticle() {
  return (
    <article className="space-y-4 animate-pulse">
      <div className="relative w-full aspect-[16/9] bg-neutral-200 dark:bg-neutral-800 skeleton rounded-sm" />
      <div className="space-y-3">
        <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 skeleton rounded" />
        <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-800 skeleton rounded" />
        <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800 skeleton rounded" />
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 skeleton rounded" />
        <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-800 skeleton rounded" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 skeleton rounded" />
          <div className="h-3 w-3 bg-neutral-200 dark:bg-neutral-800 skeleton rounded-full" />
          <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 skeleton rounded" />
        </div>
      </div>
    </article>
  )
}
