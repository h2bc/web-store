import type { Metadata } from 'next'
import ContentPageView from '@/components/content-page/content-page-view'
import { getContentPage } from '@/lib/data/content-page'
import { getContentPageRoute } from '@/lib/routes'
import { contentPageMetadata } from '@/lib/seo'

const ROUTE = getContentPageRoute('terms')

export async function generateMetadata(): Promise<Metadata> {
  const { contentPage } = await getContentPage(ROUTE.slug)

  return contentPageMetadata(contentPage, ROUTE)
}

export default function TermsPage() {
  return <ContentPageView route={ROUTE} />
}
