import ReactMarkdown from 'react-markdown'
import { notFound } from 'next/navigation'
import Heading from '@/components/layout/heading'
import ErrorAlert from '@/components/feedback/error-alert'
import { getContentPage } from '@/lib/data/content-page'
import type { ContentPageSlug } from '@/lib/routes'

interface ContentPageViewProps {
  slug: ContentPageSlug
}

export default async function ContentPageView({ slug }: ContentPageViewProps) {
  const {
    contentPage,
    error,
    notFound: isNotFound,
  } = await getContentPage(slug)

  if (isNotFound) {
    notFound()
  }

  if (error || !contentPage) {
    return (
      <div className="flex justify-center pt-15">
        <ErrorAlert message={error ?? 'Failed to load the page'} />
      </div>
    )
  }

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-4xl w-full flex flex-col">
        <Heading level={1} font="blackletter" className="mb-8">
          {contentPage.title}
        </Heading>
        <div className="prose max-w-none">
          <ReactMarkdown>{contentPage.body}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
