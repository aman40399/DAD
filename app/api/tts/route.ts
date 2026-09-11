import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const text = (searchParams.get('text') || '').trim()
    const lang = searchParams.get('lang') === 'hi' ? 'hi' : 'en'

    if (!text) {
      return new NextResponse('Missing text query parameter', { status: 400 })
    }

    // Google Translate TTS accepts up to ~200 characters per query chunk
    const sanitizedText = text.slice(0, 200)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      sanitizedText
    )}&tl=${lang}&client=tw-ob`

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      return new NextResponse('Upstream TTS service error', { status: response.status })
    }

    const audioData = await response.arrayBuffer()

    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
      },
    })
  } catch (error: any) {
    console.error('[TTS API] Synthesis error:', error)
    return new NextResponse('Internal TTS Error', { status: 500 })
  }
}
