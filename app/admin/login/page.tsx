'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/meridian/ThemeToggle'
import { IconEye, IconEyeOff } from '@/components/admin/AdminIcons'

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
      setErrorMessage('Please enter both your newsroom username and password.')
      return
    }

    setLoading(true)

    try {
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
        setErrorMessage(data.error || 'Invalid credentials')
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection error. Please retry.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-white font-sans flex flex-col justify-between selection:bg-[#0071e3]/20 relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0071e3]/10 dark:bg-[#0071e3]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Sleek Minimal Header */}
      <header className="px-6 py-4 flex items-center justify-between z-10">
        <Link
          href="/"
          className="text-xs font-semibold text-[#1d1d1f]/70 dark:text-white/70 hover:text-[#0071e3] dark:hover:text-[#2997ff] transition flex items-center gap-1.5"
          title="Back to live broadsheet"
        >
          <span>←</span>
          <span>Live Broadsheet</span>
        </Link>
        <ThemeToggle className="w-8 h-8 flex items-center justify-center rounded-full bg-white/60 dark:bg-white/[0.08] backdrop-blur-md border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f]/70 dark:text-white/70 hover:text-[#1d1d1f] dark:hover:text-white transition active:scale-95 shadow-xs" />
      </header>

      {/* Main Centered Apple Security Login Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-[380px]">
          {/* Glass Card */}
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/[0.08] dark:border-white/[0.1] rounded-3xl p-7 sm:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.5)]">
            {/* Brand Crest */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center p-2.5 mb-3 shadow-xs">
                <img
                  src="/logo.png"
                  alt="Singh Monster"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                Singh Monster
              </h1>
              <p className="text-xs text-[#1d1d1f]/60 dark:text-white/60 mt-1">
                Newsroom Desk Authentication
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 px-3.5 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center text-xs font-medium text-red-600 dark:text-red-400"
              >
                {errorMessage}
              </div>
            )}

            {/* Apple Pill Inputs Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-[11px] font-medium text-[#1d1d1f]/60 dark:text-white/60 mb-1 pl-1"
                >
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="singh"
                  required
                  className="w-full h-11 px-4 rounded-full bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#2c2c2e] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 text-[#1d1d1f] dark:text-white text-sm placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 outline-none transition"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-medium text-[#1d1d1f]/60 dark:text-white/60 mb-1 pl-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    required
                    className="w-full h-11 pl-4 pr-11 rounded-full bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:bg-white dark:focus:bg-[#2c2c2e] border border-black/[0.08] dark:border-white/[0.1] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 text-[#1d1d1f] dark:text-white text-sm placeholder:text-[#1d1d1f]/40 dark:placeholder:text-white/40 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#1d1d1f]/40 hover:text-[#1d1d1f] dark:text-white/40 dark:hover:text-white transition"
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
                className="w-full h-11 !mt-5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs tracking-tight transition shadow-[0_2px_8px_rgba(0,113,227,0.35)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center z-10">
        <p className="text-[11px] text-[#1d1d1f]/40 dark:text-white/40 tracking-tight">
          Singh Monster Media · Confidential Newsroom Systems
        </p>
      </footer>
    </div>
  )
}
