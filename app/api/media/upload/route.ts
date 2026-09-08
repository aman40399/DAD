import { NextRequest, NextResponse } from 'next/server'
import { uploadMedia } from '@/lib/r2'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''

    // Support multipart/form-data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const aspectRatio =
        (formData.get('aspectRatio') as string) ||
        (formData.get('aspect_ratio') as string) ||
        '16:10'

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // MIME type validation
      const mimeType = file.type || ''
      if (!mimeType || !mimeType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid file format: must be an image' },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      if (bytes.byteLength === 0) {
        return NextResponse.json(
          { error: 'Empty file payload: image buffer is 0 bytes' },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(bytes)
      const result = await uploadMedia(buffer, file.name, mimeType)

      return NextResponse.json({
        ...result,
        aspectRatio,
        aspect_ratio: aspectRatio,
      })
    }

    // Support JSON with base64 data url from client-side cropper
    if (contentType.includes('application/json')) {
      const body = await req.json()
      const {
        dataUrl,
        filename = 'cropped-image.webp',
        aspectRatio = '16:10',
        aspect_ratio,
      } = body

      const targetRatio = aspectRatio || aspect_ratio || '16:10'

      if (!dataUrl || !dataUrl.includes(',')) {
        return NextResponse.json({ error: 'Invalid dataUrl' }, { status: 400 })
      }

      const [header, base64Data] = dataUrl.split(',')
      const mimeMatch = header.match(/data:(.*?);base64/)
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/webp'

      if (!mimeType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Invalid file format: base64 payload must be an image' },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(base64Data, 'base64')
      if (buffer.length === 0) {
        return NextResponse.json(
          { error: 'Empty image buffer' },
          { status: 400 }
        )
      }

      const result = await uploadMedia(buffer, filename, mimeType)

      return NextResponse.json({
        ...result,
        aspectRatio: targetRatio,
        aspect_ratio: targetRatio,
      })
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
  } catch (error: any) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to upload media' },
      { status: 500 }
    )
  }
}
