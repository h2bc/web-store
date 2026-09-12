import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import ContentPageView from '@/components/content-page/content-page-view'
import { getContentPage } from '@/lib/data/content-page'
import { getContentPageRoute } from '@/lib/routes'
import { contentPageMetadata } from '@/lib/seo'

vi.mock('@/lib/data/content-page', () => ({ getContentPage: vi.fn() }))

const ROUTE = getContentPageRoute('terms')

describe('a content page without content', () => {
  it('is titled after its route and kept out of search engines', () => {
    const metadata = contentPageMetadata(null, ROUTE)

    expect(metadata).toEqual({
      title: ROUTE.label,
      robots: { index: false },
    })
  })

  it('shows the route label as the heading instead of an error', async () => {
    vi.mocked(getContentPage).mockResolvedValue({
      contentPage: null,
      error: null,
    })

    const markup = renderToStaticMarkup(await ContentPageView({ route: ROUTE }))

    expect(markup).toMatch(/<h1[^>]*>Terms &amp; Conditions<\/h1>/)
    expect(markup).not.toContain('role="alert"')
  })
})
