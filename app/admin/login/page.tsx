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
      setErrorMessage('Please enter both username and password.')
      return
    }

    setLoading(true)

    try {
      // Strictly backend authentication — zero client checks
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
      setErrorMessage(err?.message || 'Connection error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-paper dark:bg-[#09090b] text-ink dark:text-dark-ink font-sans flex flex-col justify-between selection:bg-ink/10 dark:selection:bg-white/10">
      {/* Sleek Minimal Header */}
      <header className="px-5 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs text-ink-mute dark:text-dark-mute hover:text-ink dark:hover:text-white transition flex items-center gap-1.5"
          title="Back to live broadsheet"
        >
          <span>←</span>
          <span>Live Site</span>
        </Link>
        <ThemeToggle className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-mute hover:text-ink dark:text-dark-mute dark:hover:text-white transition" />
      </header>

      {/* Main Centered Login Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[340px]">
          {/* Brand Icon & Name */}
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src="/logo.png"
              alt="Singh Monster"
              className="w-12 h-12 object-contain dark:invert mb-2.5 drop-shadow-xs"
            />
            <h1 className="font-serif font-black text-xl tracking-tight text-ink dark:text-dark-ink">
              Singh Monster
            </h1>
          </div>

          {/* Minimal Card */}
          <div className="bg-paper-subtle/50 dark:bg-[#121215] border border-rule/70 dark:border-white/[0.07] rounded-2xl p-5 sm:p-6 shadow-xs">
            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-center text-xs font-medium text-red-600 dark:text-red-400"
              >
                {errorMessage}
              </div>
            )}

            {/* Clean Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-[11px] font-medium text-ink-mute dark:text-dark-mute mb-1"
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
                  placeholder="Username"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-paper dark:bg-[#18181c] border border-rule/80 dark:border-white/10 text-ink dark:text-dark-ink text-sm placeholder:text-ink-mute/40 focus:outline-none focus:border-ink dark:focus:border-white transition"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-medium text-ink-mute dark:text-dark-mute mb-1"
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
                    placeholder="Password"
                    required
                    className="w-full h-10 pl-3 pr-10 rounded-xl bg-paper dark:bg-[#18181c] border border-rule/80 dark:border-white/10 text-ink dark:text-dark-ink text-sm placeholder:text-ink-mute/40 focus:outline-none focus:border-ink dark:focus:border-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-mute/60 hover:text-ink dark:text-dark-mute/60 dark:hover:text-white transition"
                  >
                    {showPassword ? (
                      <IconEyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <IconEye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 !mt-4 rounded-xl bg-ink hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-paper dark:text-black font-semibold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-paper/30 dark:border-black/30 border-t-paper dark:border-t-black rounded-full animate-spin" />
                    <span>Signing in...</span>
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
      <footer className="py-4 text-center">
        <p className="text-[10px] text-ink-mute/60 dark:text-dark-mute/40 font-mono tracking-widest uppercase">
          Singh Monster
        </p>
      </footer>
    </div>
  )
}
