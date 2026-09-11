'use client'

import { useState } from 'react'

export default function NewsletterBox() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || submitting) return

    setSubmitting(true)
    setErrorMessage('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'sidebar_box' }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Subscription failed. Please try again.')
      }

      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setEmail('')
      }, 5000)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to subscribe')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-paper-subtle dark:bg-dark-subtle p-4 sm:p-5 border-t-[3px] border-t-accent border-x border-b border-rule dark:border-dark-rule">
      <span className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase text-accent block">
        Sign Up
      </span>
      <h3 className="font-serif font-bold text-[18px] text-ink dark:text-dark-ink my-1.5">
        Stay informed
      </h3>
      <p className="font-serif text-[13px] text-ink-mute dark:text-dark-mute leading-relaxed mb-3.5">
        A daily briefing on the stories our editors are watching.
      </p>

      {submitted ? (
        <div className="p-3 bg-accent/10 border border-accent text-accent font-sans text-xs font-semibold text-center">
          Thank you for subscribing! Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 font-sans">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={submitting}
            className="w-full text-xs px-3 py-2.5 bg-paper dark:bg-dark-paper border border-rule dark:border-dark-rule text-ink dark:text-dark-ink placeholder:text-ink-mute focus:outline-none focus:border-accent disabled:opacity-60"
          />
          {errorMessage && (
            <p className="text-[11px] text-red-600 font-medium">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition cursor-pointer disabled:opacity-60"
          >
            {submitting ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  )
}
