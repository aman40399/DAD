import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { getArticlesByCategory } from '@/lib/articles'
import { getTimeAgo } from '@/lib/utils'

const sections = {
  world: { title: 'World News', description: 'International coverage and global affairs', category: 'World' },
  us: { title: 'U.S. News', description: 'National news and domestic affairs', category: 'Local' },
  politics: { title: 'Politics', description: 'Political news and analysis', category: 'Politics' },
  business: { title: 'Business', description: 'Financial markets and economy', category: 'Business' },
  technology: { title: 'Technology', description: 'Tech news and innovation', category: 'Technology' },
  sports: { title: 'Sports', description: 'Athletic competition and sports news', category: 'Sports' },
  arts: { title: 'Arts & Culture', description: 'Entertainment, movies, music, and culture', category: 'Arts' },
  opinion: { title: 'Opinion', description: 'Editorials, op-eds, and columns', category: 'Opinion' },
  science: { title: 'Science', description: 'Scientific discoveries and research', category: 'Science' },
  health: { title: 'Health', description: 'Health and wellness news', category: 'Health' },
  local: { title: 'Local News', description: 'Community news and local stories', category: 'Local' },
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function SectionPage({ params }: { params: { slug: string } }) {
  const section = sections[params.slug as keyof typeof sections]

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Section Not Found</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Fetch articles for this category
  const articles = await getArticlesByCategory(section.category)

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full flex-1">
            <Header />

            <main className="px-4 md:px-10 lg:px-20 max-w-[1400px] mx-auto w-full py-8">
              {/* Section Header */}
              <div className="border-b-4 border-black dark:border-white pb-6 mb-8">
                <h1 className="text-primary dark:text-neutral-50 text-5xl md:text-6xl font-black font-body leading-tight mb-3">
                  {section.title}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 text-xl font-body">
                  {section.description}
                </p>
              </div>

              {/* Articles Content */}
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg font-body mb-4">
                    No articles in this section yet.
                  </p>
                  <Link href="/" className="text-blue-600 hover:underline font-sans font-semibold">
                    Browse other sections →
                  </Link>
                </div>
              ) : (
                <div className="space-y-8">
                  {articles.map((article) => (
                    <article
                      key={article.id}
                      className="border-b border-neutral-200 dark:border-neutral-700 pb-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 p-4 -mx-4 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {article.imageUrl && (
                          <Link href={`/article/${article.slug}`} className="flex-shrink-0">
                            <div className="relative w-full md:w-64 aspect-video overflow-hidden">
                              <Image
                                src={article.imageUrl}
                                alt={article.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-sans font-bold text-blue-600 uppercase tracking-wider">
                              {section.title}
                            </span>
                            <span className="text-neutral-400">•</span>
                            <span className="text-xs text-neutral-500 font-sans">
                              {getTimeAgo(article.publishedAt)}
                            </span>
                          </div>
                          <Link href={`/article/${article.slug}`}>
                            <h2 className="text-primary dark:text-neutral-50 text-2xl md:text-3xl font-bold font-body leading-tight hover:underline mb-3">
                              {article.title}
                            </h2>
                          </Link>
                          {article.excerpt && (
                            <p className="text-neutral-600 dark:text-neutral-400 text-base font-body leading-relaxed mb-2">
                              {article.excerpt}
                            </p>
                          )}
                          <Link 
                            href={`/author/${article.author.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm text-neutral-500 hover:underline font-sans"
                          >
                            By {article.author}
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Back Link */}
              <div className="mt-12 pt-8 border-t border-neutral-300 dark:border-neutral-700">
                <Link
                  href="/"
                  className="text-blue-600 hover:underline font-sans text-sm font-semibold"
                >
                  ← Back to Home
                </Link>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return Object.keys(sections).map((slug) => ({
    slug,
  }))
}
