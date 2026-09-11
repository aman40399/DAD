import { redirect } from 'next/navigation'

export default async function CategoryRedirectPage({
  params,
}: {
  params: { slug: string }
}) {
  const resolved = await Promise.resolve(params)
  const slug = resolved?.slug || 'world'
  redirect(`/section/${slug}`)
}
