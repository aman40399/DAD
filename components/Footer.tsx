'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setTimeout(() => {
        setEmail('')
        setSubscribed(false)
      }, 3000)
    }
  }

  return (
    <footer className="mt-20 border-t-2 border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-950">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-neutral-900 dark:text-neutral-50 mb-2 sm:mb-3">
              Stay Informed
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-6 font-serif">
              Get the latest news and insights delivered to your inbox
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 rounded-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 font-serif"
                required
              />
              <button
                type="submit"
                className="px-6 py-2.5 sm:py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold tracking-widest text-xs rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all whitespace-nowrap"
              >
                {subscribed ? '✓ SUBSCRIBED' : 'SUBSCRIBE'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Image 
                src="/LOGO.png" 
                alt="Chhkwa Logo" 
                width={40} 
                height={40}
                className="object-contain sm:w-[50px] sm:h-[50px]"
              />
              <h2 className="text-neutral-900 dark:text-neutral-50 text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                Chhkwa
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-3 sm:mb-4 font-serif leading-relaxed">
              Your trusted source for news, analysis, and insights from around the world.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect height="20" rx="5" ry="5" width="20" x="2" y="2" fill="none" stroke="currentColor" strokeWidth="2"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="currentColor" strokeWidth="2"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="currentColor" strokeWidth="2"></line>
                </svg>
              </a>
              <a className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50 mb-4 border-b-2 border-neutral-900 dark:border-neutral-100 pb-2">
              Sections
            </h4>
            <ul className="space-y-2">
              <li><a href="/section/world" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">World</a></li>
              <li><a href="/section/us" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">U.S.</a></li>
              <li><a href="/section/politics" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Politics</a></li>
              <li><a href="/section/business" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Business</a></li>
              <li><a href="/section/technology" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Technology</a></li>
              <li><a href="/section/sports" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Sports</a></li>
              <li><a href="/section/arts" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Arts & Culture</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50 mb-4 border-b-2 border-neutral-900 dark:border-neutral-100 pb-2">
              Company
            </h4>
            <ul className="space-y-2">
              <li><a href="/about-us" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">About Us</a></li>
              <li><a href="/contact-us" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Contact Us</a></li>
              <li><a href="mailto:dhananjay.singh1975@gmail.com" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Advertise</a></li>
              <li><a href="/about-us" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Careers</a></li>
              <li><a href="/about-us" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Press</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-neutral-50 mb-4 border-b-2 border-neutral-900 dark:border-neutral-100 pb-2">
              Legal
            </h4>
            <ul className="space-y-2">
              <li><a href="/privacy-policy" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Privacy Policy</a></li>
              <li><a href="/terms-conditions" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Terms & Conditions</a></li>
              <li><a href="/disclaimer" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Disclaimer</a></li>
              <li><a href="/about-us" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors font-serif">Accessibility</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-600 font-serif">
            © 2025 Chhkwa. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-600">
            <span className="font-serif">Made with care for readers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
