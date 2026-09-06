import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-9xl font-black font-playfair mb-4 text-neutral-900 dark:text-white">404</h1>
        <h2 className="text-3xl font-bold font-playfair mb-4 text-neutral-800 dark:text-neutral-200">
          Article Not Found
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 font-body">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-sm hover:bg-blue-700 transition-colors uppercase tracking-wider font-sans"
          >
            Go to Homepage
          </Link>
          <Link
            href="/section/world"
            className="px-6 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold text-sm rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors uppercase tracking-wider font-sans"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    </div>
  )
}
