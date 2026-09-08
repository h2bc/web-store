export interface ProductItem {
  slug: string
  name: string
  price: number | null
  image: string
  hoverImage?: string
  soldOut?: boolean
  category: string
  currencyCode: string | null
}
