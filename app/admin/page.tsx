'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If client session is authenticated, verify server-side that the user
    // is allowed before redirecting to the dashboard. This avoids a
    // redirect loop when a client-side session exists but server rejects
    // the user (e.g., not in ADMIN_EMAILS).
    if (status === 'authenticated') {
      ;(async () => {
        try {
          const res = await fetch('/api/auth/session')
          const data = await res.json()
          if (data.authenticated) {
            router.push('/admin/dashboard')
          }
        } catch (err) {
          // If verification fails, stay on the login page so user can sign in
          console.error('Server session verification failed:', err)
        }
      })()
    }
  }, [status, router])

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', {
        callbackUrl: '/admin/dashboard',
        prompt: 'select_account', // Always show account picker
      })
    } catch (error) {
      console.error('Sign in error:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-3xl shadow-xl">
              C
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Chhkwa CMS
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-sans">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 backdrop-blur-sm">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all font-sans font-semibold text-neutral-700 dark:text-neutral-200 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="group-hover:text-blue-600 transition-colors">Sign in with Google</span>
          </button>

          <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400 font-sans space-y-2">
            <p className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Authorized admins only
            </p>
            <p className="text-xs">
              Contact your administrator to add your email to the allowed list
            </p>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-6 text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-sans font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </Link>
          <p className="text-xs text-neutral-500 dark:text-neutral-600">
            Powered by Chhkwa CMS © 2025
          </p>
        </div>
      </div>
    </div>
  )
}
