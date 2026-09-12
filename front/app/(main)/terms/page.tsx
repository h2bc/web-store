import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContentPageView from '@/components/content-page/content-page-view'
import { getContentPage } from '@/lib/data/content-page'
import { contentPageMetadata } from '@/lib/seo'

const SLUG = 'terms'
const PATH = '/terms'

export async function generateMetadata(): Promise<Metadata> {
  const { contentPage, notFound: isNotFound } = await getContentPage(SLUG)

  if (isNotFound) {
    notFound()
  }

  return contentPageMetadata(contentPage, PATH)
}

export default function TermsPage() {
  return <ContentPageView slug={SLUG} />
}
