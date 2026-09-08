'use client'

import { useState } from 'react'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'

interface ArticleHeroImageProps {
  src: string
  alt: string
  caption?: string
}

export default function ArticleHeroImage({ src, alt, caption }: ArticleHeroImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <figure className="my-6 m-0">
      <div className="aspect-[16/10] overflow-hidden bg-paper-subtle dark:bg-dark-subtle border border-rule dark:border-dark-rule">
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => {
            if (imgSrc !== FALLBACK_IMAGE) {
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
