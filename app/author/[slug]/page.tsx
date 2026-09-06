import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const authors = {
  'dhananjay-singh': {
    name: 'Dhananjay Singh',
    role: 'Professional Content Writer, Researcher & Visionary Storyteller',
    bio: 'Dhananjay Singh is a professional content writer with a passion for exploring complex ideas and transforming them into compelling narratives. With a keen eye for detail and a commitment to authenticity, Dhananjay specializes in crafting content that resonates, informs, and inspires action. As a researcher and storyteller, he brings a unique blend of analytical rigor and creative flair to every piece. With experience spanning multiple domains—including politics, technology, social issues, and philosophy—Dhananjay believes in the power of words to shape reality. Every story is an opportunity to question the status quo and imagine new possibilities.',
    image: 'https://sgnqnllnnhhrzvdwwktz.supabase.co/storage/v1/object/public/article-images/IMG_20130101_0600.JPG',
    email: 'contact@chhkwa.com',
    twitter: '@chhkwa',
    tagline: 'तरक्की को चाहिए नया नज़रिया—और यह नज़रिया शब्दों से शुरू होता है। | Progress needs a new perspective—and that perspective begins with words.',
  },
}

export default function AuthorPage({ params }: { params: { slug: string } }) {
  const author = authors[params.slug as keyof typeof authors]

  if (!author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Author Not Found</h1>
          <Link href="/about" className="text-blue-600 hover:underline">
            Back to About Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <Header />

            <main className="mt-8 mb-16">
              {/* Author Profile */}
              <div className="border-b-4 border-black dark:border-white pb-8 mb-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div
                    className="w-48 h-48 bg-cover bg-center rounded-full flex-shrink-0 mx-auto md:mx-0"
                    style={{ backgroundImage: `url(${author.image})` }}
                  />
                  <div className="flex-1">
                    <h1 className="text-primary dark:text-neutral-50 text-4xl md:text-5xl font-black font-body leading-tight mb-2">
                      {author.name}
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xl font-sans font-semibold mb-4 italic">
                      {author.role}
                    </p>
                    <p className="text-neutral-700 dark:text-neutral-300 text-lg font-body leading-relaxed mb-6">
                      {author.bio}
                    </p>
                    <blockquote className="border-l-4 border-blue-600 pl-4 py-2 mb-6 bg-neutral-50 dark:bg-neutral-900">
                      <p className="text-neutral-800 dark:text-neutral-200 font-body italic text-base leading-relaxed">
                        {author.tagline}
                      </p>
                    </blockquote>
                    <div className="flex gap-4 items-center flex-wrap">
                      <a
                        href={`mailto:${author.email}`}
                        className="text-blue-600 hover:underline font-sans text-sm font-semibold"
                      >
                        📧 {author.email}
                      </a>
                      <span className="text-neutral-400">•</span>
                      <a
                        href={`https://twitter.com/${author.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-sans text-sm font-semibold"
                      >
                        𝕏 {author.twitter}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="mb-12 bg-neutral-50 dark:bg-neutral-900 p-8 rounded-sm border-l-4 border-blue-600">
                <h2 className="text-primary dark:text-neutral-50 text-2xl font-bold font-body mb-4">
                  Writing Philosophy
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 text-base font-body leading-relaxed mb-4">
                  At <strong>Chhkwa.com</strong>, we don't just report the news—we explore the "why" and "what's next." 
                  Every article is crafted with depth, clarity, and integrity, aiming to challenge conventional narratives 
                  and amplify diverse voices.
                </p>
                <p className="text-neutral-700 dark:text-neutral-300 text-base font-body leading-relaxed">
                  Whether it's politics, culture, technology, or social issues, each piece is an invitation to reimagine 
                  progress, one story at a time.
                </p>
              </div>

              {/* Back Link */}
              <div className="mt-12 pt-8 border-t-2 border-neutral-300 dark:border-neutral-700">
                <Link
                  href="/about"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-sans font-bold text-sm rounded-sm hover:bg-blue-700 transition-colors uppercase tracking-wider"
                >
                  ← Back to About Page
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
  return Object.keys(authors).map((slug) => ({
    slug,
  }))
}
