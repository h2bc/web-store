import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateQueryParams<T extends z.ZodType>(
  request: Request,
  schema: T
):
  | { success: true; data: z.infer<T> }
  | { success: false; response: NextResponse } {
  const { searchParams } = new URL(request.url)
  const params = Object.fromEntries(searchParams.entries())

  const validation = schema.safeParse(params)
  if (!validation.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      ),
    }
  }

  return { success: true, data: validation.data }
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
