export const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export const PUBLIC_PATHS = [
  '/',
  ...NAV_LINKS.map((link) => link.href),
  '/shipping-returns',
]

export function productPath(handle: string): string {
  return `/shop/${handle}`
}
