import { ProductGrid } from 'h2bc-web-front'

const svg = (body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${body}</svg>`
  )}`

const tee = (fill: string) =>
  svg(
    `<path fill="${fill}" d="M70 30 L100 44 L130 30 L176 56 L160 88 L140 78 L140 176 L60 176 L60 78 L40 88 L24 56 Z"/>`
  )
const hoodie = (fill: string) =>
  svg(
    `<path fill="${fill}" d="M62 34 L100 20 L138 34 L178 60 L162 92 L142 82 L142 178 L58 178 L58 82 L38 92 L22 60 Z"/><path fill="#fff" fill-opacity="0.35" d="M80 40 Q100 62 120 40 Q100 76 80 40 Z"/><rect x="70" y="128" width="60" height="32" rx="4" fill="#fff" fill-opacity="0.25"/>`
  )
const cap = (fill: string) =>
  svg(
    `<path fill="${fill}" d="M40 120 Q40 50 100 50 Q160 50 160 120 Z"/><path fill="${fill}" d="M30 120 L160 120 Q190 122 186 138 Q150 132 30 132 Z"/>`
  )

const products = [
  {
    slug: 'h2bc-logo-tee',
    name: 'h2bc logo tee',
    price: 35,
    currencyCode: 'eur',
    image: tee('#111111'),
    category: 'TEES',
  },
  {
    slug: 'oversized-hoodie',
    name: 'oversized hoodie',
    price: 54,
    currencyCode: 'eur',
    image: hoodie('#111111'),
    hoverImage: hoodie('#3b3b3b'),
    category: 'HOODIES',
  },
  {
    slug: 'h2bc-cap',
    name: 'h2bc cap',
    price: 25,
    currencyCode: 'eur',
    image: cap('#111111'),
    category: 'CAPS',
  },
  {
    slug: 'washed-tee-charcoal',
    name: 'washed tee',
    price: 38,
    currencyCode: 'eur',
    image: tee('#3b3b3b'),
    soldOut: true,
    category: 'TEES',
  },
]

export const Default = () => (
  <div className="grid grid-cols-4 gap-6">
    <ProductGrid products={products} />
  </div>
)

export const HoverImagesDisabled = () => (
  <div className="grid grid-cols-2 gap-6">
    <ProductGrid products={products.slice(0, 2)} enableHoverImages={false} />
  </div>
)

export const Empty = () => (
  <div className="grid grid-cols-2 gap-6">
    <ProductGrid products={[]} />
  </div>
)
