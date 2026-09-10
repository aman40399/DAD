'use client'

import { useState } from 'react'
import Image from 'next/image'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'

interface ArticleHeroImageProps {
  src: string
  alt: string
  caption?: string
  priority?: boolean
}

export default function ArticleHeroImage({
  src,
  alt,
  caption,
  priority = true,
}: ArticleHeroImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  return (
    <figure className="my-6 m-0">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule">
        <Image
          src={hasError ? FALLBACK_IMAGE : imgSrc}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 980px"
          quality={82}
          className="object-cover"
          onError={() => {
            if (!hasError) {
              setHasError(true)
              setImgSrc(FALLBACK_IMAGE)
            }
          }}
        />
      </div>
      {caption && (
        <figcaption className="text-xs font-sans text-ink-mute dark:text-dark-mute mt-2 pt-1 border-t border-rule dark:border-dark-rule italic leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

