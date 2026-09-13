import type { ContentPage } from '@/lib/types/content-page'

export const TERMS: ContentPage = {
  slug: 'terms',
  title: 'Terms',
  description: 'How we sell and ship.',
  body: '## Orders\n\nEvery order is final.',
  updatedAt: '2026-09-12T00:00:00.000Z',
}

export const TERMS_UNTITLED: ContentPage = { ...TERMS, title: null }
