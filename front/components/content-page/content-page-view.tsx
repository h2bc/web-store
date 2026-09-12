import ReactMarkdown from 'react-markdown'
import Heading from '@/components/layout/heading'
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

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-4xl w-full flex flex-col">
        <Heading level={1} font="blackletter" className="mb-8">
          {contentPage?.title ?? route.label}
        </Heading>
        {contentPage ? (
          <div className="prose max-w-none">
            <ReactMarkdown>{contentPage.body}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted-foreground">No content yet</p>
        )}
      </div>
    </div>
  )
}
