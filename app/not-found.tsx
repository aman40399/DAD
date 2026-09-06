import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col w-full flex-1">
            <Header />

            <main className="px-4 md:px-10 lg:px-20 max-w-[1400px] mx-auto w-full flex-1 flex items-center justify-center py-20">
              <div className="text-center max-w-2xl">
                <h1 className="text-9xl font-black font-body text-primary dark:text-neutral-50 mb-4">
                  404
                </h1>
                <h2 className="text-4xl font-bold font-body text-primary dark:text-neutral-50 mb-6">
                  Page Not Found
                </h2>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 font-body mb-8 leading-relaxed">
                  We're sorry, but the page you're looking for doesn't exist or has been moved.
                  Please check the URL or return to our homepage.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link
                    href="/"
                    className="px-8 py-3 bg-primary dark:bg-white text-white dark:text-primary font-sans font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Go to Homepage
                  </Link>
                  <Link
                    href="/about"
                    className="px-8 py-3 border-2 border-primary dark:border-white text-primary dark:text-white font-sans font-bold text-sm uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    About Us
                  </Link>
                </div>
                
                {/* Popular Sections */}
                <div className="mt-16 pt-8 border-t border-neutral-300 dark:border-neutral-700">
                  <h3 className="text-lg font-bold font-body text-primary dark:text-neutral-50 mb-4">
                    Popular Sections
                  </h3>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Link href="/section/world" className="text-blue-600 hover:underline font-sans text-sm">
                      World News
                    </Link>
                    <span className="text-neutral-400">•</span>
                    <Link href="/section/politics" className="text-blue-600 hover:underline font-sans text-sm">
                      Politics
                    </Link>
                    <span className="text-neutral-400">•</span>
                    <Link href="/section/business" className="text-blue-600 hover:underline font-sans text-sm">
                      Business
                    </Link>
                    <span className="text-neutral-400">•</span>
                    <Link href="/section/technology" className="text-blue-600 hover:underline font-sans text-sm">
                      Technology
                    </Link>
                    <span className="text-neutral-400">•</span>
                    <Link href="/section/sports" className="text-blue-600 hover:underline font-sans text-sm">
                      Sports
                    </Link>
                  </div>
                </div>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
