import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  url.pathname = '/feed.xml'
  return NextResponse.redirect(url, { status: 301 })
}
