import { NextRequest, NextResponse } from 'next/server'
import { getArticleBySlug, getArticleById, getAllArticles, isD1Configured } from '@/lib/articles'
import { queryD1 } from '@/lib/d1'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') || '6g-us-26'
  const id = request.nextUrl.searchParams.get('id') || '9a507fae-504f-4f82-9c81-3d9e3f5c485f'

  const diag: any = {
    testedSlug: slug,
    testedId: id,
    isD1Configured: isD1Configured(),
  }

  try {
    const rawQuery = await queryD1('SELECT id, title, slug, status, category, published_at FROM articles WHERE slug = ?', [slug])
    diag.rawQueryBySlug = rawQuery
  } catch (e: any) {
    diag.rawQueryBySlugError = e.message || String(e)
  }

  try {
    const rawAll = await queryD1('SELECT id, slug, status FROM articles ORDER BY published_at DESC LIMIT 5', [])
    diag.rawAll = rawAll
  } catch (e: any) {
    diag.rawAllError = e.message || String(e)
  }

  try {
    const artBySlug = await getArticleBySlug(slug)
    diag.artBySlug = artBySlug ? { id: artBySlug.id, slug: artBySlug.slug, title: artBySlug.title, status: artBySlug.status } : null
  } catch (e: any) {
    diag.artBySlugError = e.message || String(e)
  }

  try {
    const artById = await getArticleById(id)
    diag.artById = artById ? { id: artById.id, slug: artById.slug, title: artById.title, status: artById.status } : null
  } catch (e: any) {
    diag.artByIdError = e.message || String(e)
  }

  try {
    const all = await getAllArticles()
    diag.allArticlesCount = all.length
    diag.foundInAll = all.some(a => a.slug === slug || a.id === id)
  } catch (e: any) {
    diag.allArticlesError = e.message || String(e)
  }

  return NextResponse.json(diag)
}
