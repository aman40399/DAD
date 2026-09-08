import { notFound } from 'next/navigation'
import ArticleEditorForm from '@/components/admin/ArticleEditorForm'
import { getArticleById } from '@/lib/articles'

export const dynamic = 'force-dynamic'

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id)

  if (!article) {
    notFound()
  }

  return <ArticleEditorForm initialArticle={article} isEditing={true} />
}
