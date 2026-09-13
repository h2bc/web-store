import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ContentPageView from '@/components/content-page/content-page-view'
import { getContentPage } from '@/lib/data/content-page'
import { getContentPageRoute } from '@/lib/routes'
import { contentPageMetadata } from '@/lib/seo'
import { TERMS, TERMS_UNTITLED } from './support/data'

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

  it('shows no heading and no error', async () => {
    vi.mocked(getContentPage).mockResolvedValue({
      contentPage: null,
      error: null,
    })

    render(await ContentPageView({ route: ROUTE }))

    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('a content page with content', () => {
  it('is titled after its route and described by the page', () => {
    const metadata = contentPageMetadata(TERMS, ROUTE)

    expect(metadata).toEqual({
      title: ROUTE.label,
      description: TERMS.description,
      alternates: { canonical: ROUTE.path },
    })
  })

  it("shows the owner's title as the heading above the body", async () => {
    vi.mocked(getContentPage).mockResolvedValue({
      contentPage: TERMS,
      error: null,
    })

    render(await ContentPageView({ route: ROUTE }))

    expect(
      screen.getByRole('heading', { level: 1, name: TERMS.title! })
    ).toBeDefined()
    expect(screen.getByRole('heading', { level: 2 })).toBeDefined()
  })

  it('shows no heading when the owner left the title empty', async () => {
    vi.mocked(getContentPage).mockResolvedValue({
      contentPage: TERMS_UNTITLED,
      error: null,
    })

    render(await ContentPageView({ route: ROUTE }))

    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    expect(screen.getByRole('heading', { level: 2 })).toBeDefined()
  })
})
