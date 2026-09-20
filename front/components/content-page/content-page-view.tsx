import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Heading from '@/components/layout/heading'
import EmptyState, { EmptyStateTitle } from '@/components/feedback/empty-state'
import ErrorAlert from '@/components/feedback/error-alert'
import { getContentPage } from '@/lib/data/content-page'
import type { ContentPageRoute } from '@/lib/routes'

interface ContentPageViewProps {
  route: ContentPageRoute
}

export default async function ContentPageView({ route }: ContentPageViewProps) {
  const { contentPage, error } = await getContentPage(route.slug)

  if (error) {
    return (
      <div className="flex justify-center pt-15">
        <ErrorAlert message={error} />
      </div>
    )
  }

  if (!contentPage) {
    return (
      <div className="flex-1 flex flex-col self-stretch items-center justify-center">
        <EmptyState description="This page is still being written.">
          <EmptyStateTitle>No content yet</EmptyStateTitle>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-4xl w-full flex flex-col">
        {contentPage.title && (
          <Heading level={1} font="blackletter" className="mb-8">
            {contentPage.title}
          </Heading>
        )}
        <div className="prose max-w-none overflow-x-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentPage.body}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
