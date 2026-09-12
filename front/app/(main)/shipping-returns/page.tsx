import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContentPageView from '@/components/content-page/content-page-view'
import { getContentPage } from '@/lib/data/content-page'
import { contentPageMetadata } from '@/lib/seo'

const SLUG = 'shipping-returns'
const PATH = '/shipping-returns'

export async function generateMetadata(): Promise<Metadata> {
  const { contentPage, notFound: isNotFound } = await getContentPage(SLUG)

  if (isNotFound) {
    notFound()
  }

  return contentPageMetadata(contentPage, PATH)
}

export default function ShippingReturnsPage() {
  return <ContentPageView slug={SLUG} />
}
