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

export function formatPrice(
  amount?: number | null,
  currencyCode?: string | null
): string {
  const FRACTION_DIGITS = 2

  if (amount == null || Number.isNaN(amount)) {
    return 'NOT AVAILABLE'
  }

  if (!currencyCode) {
    return `??${amount.toFixed(FRACTION_DIGITS)} ???`
  }

  const code = currencyCode.toUpperCase()

  // Get currency symbol using Intl
  const symbol =
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value || '??'

  const formatted = amount.toLocaleString('lt-LT', {
    minimumFractionDigits: FRACTION_DIGITS,
    maximumFractionDigits: FRACTION_DIGITS,
  })

  return `${symbol}${formatted} ${code}`
}
