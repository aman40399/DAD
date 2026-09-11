'use client'

import { useState } from 'react'

interface ArticleShareBarProps {
  title: string
  url: string
}

export default function ArticleShareBar({ title, url }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement('input')
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${url}`)}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 text-xs select-none">
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute dark:text-dark-mute mr-1">
        Share:
      </span>

      {/* X / Twitter */}
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-rule dark:border-dark-rule hover:border-ink dark:hover:border-dark-ink text-ink dark:text-dark-ink hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer active:scale-95"
        title="Share dispatch on X / Twitter"
      >
        <span className="font-bold text-xs">𝕏</span>
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-rule dark:border-dark-rule hover:border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 transition cursor-pointer active:scale-95"
        title="Share dispatch on WhatsApp"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.222-.559-1.827-.759-3.003-2.613-3.094-2.735-.091-.122-.734-.977-.734-1.864 0-.887.465-1.324.631-1.503.166-.179.362-.224.482-.224.12 0 .241.002.346.007.11.005.258-.042.404.308.151.361.516 1.258.561 1.35.045.092.075.2.015.321-.06.121-.09.196-.18.301-.09.106-.189.236-.27.316-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.62 1.285.812 1.467.903.182.091.287.076.392-.045.106-.121.453-.529.574-.71.121-.181.241-.151.404-.091.163.061 1.037.489 1.215.578.178.09.297.135.341.21.045.075.045.436-.099.841z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-rule dark:border-dark-rule hover:border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10 transition cursor-pointer active:scale-95"
        title="Share dispatch on LinkedIn"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.59 1.59 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.59 1.59 0 0 0-1.6-1.6Z" />
        </svg>
      </a>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="relative flex items-center gap-1 px-3 py-1.5 rounded-full border border-rule dark:border-dark-rule hover:border-ink dark:hover:border-dark-ink text-ink dark:text-dark-ink hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer active:scale-95 font-medium text-[11px]"
        title="Copy article URL to clipboard"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-green-600 dark:text-green-400 font-bold">Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  )
}
