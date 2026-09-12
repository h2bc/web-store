export const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const CONTENT_PAGES = [
  { slug: 'privacy', path: '/privacy', label: 'Privacy Policy' },
  {
    slug: 'shipping-returns',
    path: '/shipping-returns',
    label: 'Shipping & Returns',
  },
  { slug: 'terms', path: '/terms', label: 'Terms & Conditions' },
  { slug: 'about', path: '/about', label: 'About' },
] as const

export type ContentPageSlug = (typeof CONTENT_PAGES)[number]['slug']

export type ContentPageRoute = (typeof CONTENT_PAGES)[number]

export const getContentPageRoute = (slug: ContentPageSlug): ContentPageRoute =>
  CONTENT_PAGES.find((page) => page.slug === slug) ?? CONTENT_PAGES[0]

export const POLICY_PAGES = CONTENT_PAGES.filter(
  (page) => page.slug !== 'about'
)

export const PUBLIC_PATHS = [
  ...new Set([
    '/',
    ...NAV_LINKS.map((link) => link.href),
    ...CONTENT_PAGES.map((page) => page.path),
  ]),
]

export function productPath(handle: string): string {
  return `/shop/${handle}`
}
