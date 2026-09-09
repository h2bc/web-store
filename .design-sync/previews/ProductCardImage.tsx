import { ProductCardImage } from 'h2bc-web-front'

const svg = (body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${body}</svg>`
  )}`

const tee = (fill: string) =>
  svg(
    `<path fill="${fill}" d="M70 30 L100 44 L130 30 L176 56 L160 88 L140 78 L140 176 L60 176 L60 78 L40 88 L24 56 Z"/>`
  )
const cap = (fill: string) =>
  svg(
    `<path fill="${fill}" d="M40 120 Q40 50 100 50 Q160 50 160 120 Z"/><path fill="${fill}" d="M30 120 L160 120 Q190 122 186 138 Q150 132 30 132 Z"/>`
  )

export const Default = () => (
  <div className="relative aspect-square w-48">
    <ProductCardImage src={tee('#111111')} alt="h2bc logo tee" />
  </div>
)

export const WithHoverImage = () => (
  <div className="relative aspect-square w-48">
    <ProductCardImage
      src={cap('#111111')}
      alt="h2bc cap, front"
      hoverSrc={cap('#3b3b3b')}
      hoverAlt="h2bc cap, side"
    />
  </div>
)

export const Sizes = () => (
  <div className="flex items-end gap-6">
    <div className="relative aspect-square w-24">
      <ProductCardImage src={tee('#111111')} alt="h2bc logo tee" />
    </div>
    <div className="relative aspect-square w-32">
      <ProductCardImage src={cap('#111111')} alt="h2bc cap" />
    </div>
    <div className="relative aspect-square w-48">
      <ProductCardImage src={tee('#3b3b3b')} alt="h2bc logo tee, charcoal" />
    </div>
  </div>
)
