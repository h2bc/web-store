export interface ProductImage {
  id: string
  url: string
}

export interface SizeOption {
  value: string
  available: boolean
  option_id: string
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  currency: string
  manage_inventory: boolean
  inventory_quantity: number
  options: {
    option_id: string
    value: string
  }[]
}

export interface ProductOption {
  id: string
  title: string
}

export interface ProductDetail {
  slug: string
  name: string
  subtitle: string
  images: ProductImage[]
  sizes: SizeOption[]
  description: string
  alert?: string
  variants: ProductVariant[]
  options: ProductOption[]
}
