interface YouTubeEmbedProps {
  videoId: string
  title?: string
  className?: string
}

export default function YouTubeEmbed({ videoId, title = 'YouTube video', className = '' }: YouTubeEmbedProps) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '1',
    rel: '0',
    modestbranding: '1',
  })

  return (
    <div className={`relative w-full aspect-video ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full rounded-sm"
      />
    </div>
  )
}
