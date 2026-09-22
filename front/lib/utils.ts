import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ProductVariant } from '@/lib/types/product-detail'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isVariantAvailable(variant: {
  manage_inventory?: boolean | null
  inventory_quantity?: number | null
}): boolean {
  return !variant.manage_inventory || (variant.inventory_quantity ?? 0) > 0
}

export function selectDisplayVariant(
  variants: ProductVariant[]
): ProductVariant | null {
  const available = variants.filter(isVariantAvailable)

  return (available.length ? available : variants)
    .filter((v) => v.currency)
    .reduce<ProductVariant | null>(
      (best, v) => (best === null || v.price < best.price ? v : best),
      null
    )
}

const LOCALE = 'en-US'

export function formatPrice(
  amount?: number | null,
  currencyCode?: string | null
): string {
  if (amount == null || Number.isNaN(amount) || !currencyCode) {
    return 'NOT AVAILABLE'
  }

  const code = currencyCode.toUpperCase()
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: code,
  }).format(amount)

  return `${formatted} ${code}`
}
