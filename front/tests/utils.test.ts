import { describe, expect, it } from 'vitest'
import { formatPrice } from '@/lib/utils'

describe('price formatting', () => {
  it('shows the symbol, the amount and the currency code', () => {
    const amount = 80

    const price = formatPrice(amount, 'eur')

    expect(price).toBe('€80.00 EUR')
  })

  it('rounds to two decimals', () => {
    const amount = 95.499

    const price = formatPrice(amount, 'usd')

    expect(price).toBe('$95.50 USD')
  })

  it('tells the shopper when a price is not available', () => {
    const amount = null

    const price = formatPrice(amount, 'eur')

    expect(price).toBe('NOT AVAILABLE')
  })
})
