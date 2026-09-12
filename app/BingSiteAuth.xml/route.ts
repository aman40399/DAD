import { NextResponse } from 'next/server'

export const dynamic = 'force-static'
export const revalidate = 86400

export async function GET() {
  const bingCode = process.env.BING_SITE_VERIFICATION || 'c7f5399d8b314959a9041a996efefd39'
  return new NextResponse(
    `<?xml version="1.0"?><users><user>${bingCode}</user></users>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  )
}
