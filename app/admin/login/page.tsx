'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/meridian/ThemeToggle'
import { IconLock, IconEye, IconEyeOff } from '@/components/admin/AdminIcons'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!username.trim() || !password) {
      setErrorMessage('Please provide both username and password.')
      return
    }

    setLoading(true)

    try {
      // Strictly backend authentication — no password checks in client code
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid credentials. Access denied.')
        setLoading(false)
        return
      }

      // Successful authentication: navigate to Admin Desk
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-paper dark:bg-[#0a0a0c] text-ink dark:text-dark-ink font-sans flex flex-col justify-between selection:bg-accent/20">
      {/* Top Utility Header */}
      <header className="px-4 py-3.5 sm:px-8 sm:py-5 flex items-center justify-between border-b border-rule/50 dark:border-white/[0.06]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white transition group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>Back to Live Broadsheet</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle className="w-8 h-8 flex items-center justify-center rounded-xl bg-paper-subtle dark:bg-white/[0.05] border border-rule/60 dark:border-white/10 text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white transition" />
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          {/* Editorial Card */}
          <div className="bg-paper-subtle/70 dark:bg-[#111114] border border-rule dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Crest & Masthead */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center mb-3.5">
                <img
                  src="/logo.png"
                  alt="Singh Monster"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain dark:invert"
                />
              </div>
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-accent font-semibold mb-1">
                Restricted Editorial Desk
              </p>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink dark:text-dark-ink tracking-tight">
                Singh Monster
              </h1>
              <p className="text-xs text-ink-mute dark:text-dark-mute mt-1">
                Sign in to manage broadsheet stories, positions, and media.
              </p>
            </div>

            {/* Error Message Alert Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400"
              >
                <div className="mt-0.5 shrink-0">
                  <IconLock className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="leading-relaxed flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block font-mono text-[11px] uppercase tracking-wider text-ink-mute dark:text-dark-mute font-semibold mb-1.5"
                >
                  Editor Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="admin"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-paper dark:bg-[#18181c] border border-rule/70 dark:border-white/10 text-ink dark:text-dark-ink text-sm placeholder:text-ink-mute/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block font-mono text-[11px] uppercase tracking-wider text-ink-mute dark:text-dark-mute font-semibold"
                  >
                    Passkey
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••••••"
                    required
                    className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-paper dark:bg-[#18181c] border border-rule/70 dark:border-white/10 text-ink dark:text-dark-ink text-sm placeholder:text-ink-mute/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink-mute hover:text-ink dark:text-dark-mute dark:hover:text-white transition"
                  >
                    {showPassword ? (
                      <IconEyeOff className="w-4 h-4" />
                    ) : (
                      <IconEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 rounded-xl bg-ink hover:bg-black dark:bg-white dark:hover:bg-neutral-200 text-paper dark:text-black font-semibold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-paper/30 dark:border-black/30 border-t-paper dark:border-t-black rounded-full animate-spin" />
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <span>Sign In to Newsroom</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-rule/50 dark:border-white/[0.06] text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute dark:text-dark-mute">
                Protected by HMAC Session Verification · Cloudflare
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Broadsheet Colophon Footer */}
      <footer className="px-4 py-4 sm:px-8 border-t border-rule/50 dark:border-white/[0.06] text-center">
        <p className="text-[11px] text-ink-mute dark:text-dark-mute font-mono">
          Singh Monster Broadsheet · Autonomous Publishing Infrastructure
        </p>
      </footer>
    </div>
  )
}
