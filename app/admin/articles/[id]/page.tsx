import { redirect } from 'next/navigation'

export default function ArticleRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/admin/articles/${params.id}/edit`)
}
