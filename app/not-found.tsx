import Link from 'next/link'
import Masthead from '@/components/meridian/Masthead'
import Footer from '@/components/meridian/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink">
      <Masthead brandName="Singh Monster" tagline="Sharp reporting. Deep analysis. No agenda but the truth." />

      <main className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 w-full flex items-center justify-center py-24 text-center">
        <div className="max-w-md">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">
            Error 404
          </p>
          <h1 className="font-serif font-black text-5xl sm:text-6xl text-ink dark:text-dark-ink mb-4">
            Page Not Found
          </h1>
          <p className="font-serif italic text-base text-ink-mute dark:text-dark-mute mb-8 leading-relaxed">
            The story or page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper font-sans text-xs font-bold uppercase tracking-widest hover:opacity-90 transition"
          >
            Return to Homepage
          </Link>
        </div>
      </main>

      <Footer brandName="Singh Monster" />
    </div>
  )
}
