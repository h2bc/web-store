import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
