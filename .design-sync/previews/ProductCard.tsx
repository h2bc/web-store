import { ProductCard } from 'h2bc-web-front'

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

const BLACK = '#111111'
const CHARCOAL = '#3b3b3b'

export const Default = () => (
  <div className="w-64">
    <ProductCard
      slug="h2bc-logo-tee"
      name="h2bc logo tee"
      price={35}
      currencyCode="eur"
      image={tee(BLACK)}
    />
  </div>
)

export const WithHoverImage = () => (
  <div className="w-64">
    <ProductCard
      slug="oversized-hoodie"
      name="oversized hoodie"
      price={54}
      currencyCode="eur"
      image={hoodie(BLACK)}
      hoverImage={hoodie(CHARCOAL)}
    />
  </div>
)

export const SoldOut = () => (
  <div className="w-64">
    <ProductCard
      slug="oversized-hoodie-black"
      name="oversized hoodie"
      price={54}
      currencyCode="eur"
      image={hoodie(BLACK)}
      soldOut
    />
  </div>
)

export const PriceUnavailable = () => (
  <div className="w-64">
    <ProductCard
      slug="h2bc-logo-tee-white"
      name="h2bc logo tee"
      price={null}
      currencyCode={null}
      image={tee(CHARCOAL)}
    />
  </div>
)
