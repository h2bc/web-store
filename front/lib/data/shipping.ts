'use server'

import { sdk } from '@/lib/medusa'
import { getCartId } from '@/lib/cookies'
import type { HttpTypes } from '@medusajs/types'

export type ShippingOptionSummary = {
  id: string
  name: string
  amount: number | null
  isCalculated: boolean
}

type ShippingOptionsResult = {
  options: ShippingOptionSummary[]
  error: string | null
}

export async function listCartShippingOptions(): Promise<ShippingOptionsResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return { options: [], error: 'No cart found' }
  }

  try {
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
      cart_id: cartId,
    })

    return {
      options: shipping_options.map(
        (option: HttpTypes.StoreCartShippingOption) => ({
          id: option.id,
          name: option.name,
          amount: option.amount ?? null,
          isCalculated: option.price_type === 'calculated',
        })
      ),
      error: null,
    }
  } catch (error) {
    console.error('Failed to fetch shipping options:', error)
    return { options: [], error: 'Failed to load delivery options.' }
  }
}

export async function calculateShippingPrice(
  optionId: string
): Promise<{ amount: number | null; error: string | null }> {
  const cartId = await getCartId()

  if (!cartId) {
    return { amount: null, error: 'No cart found' }
  }

  try {
    const { shipping_option } = await sdk.store.fulfillment.calculate(
      optionId,
      {
        cart_id: cartId,
      }
    )

    return { amount: shipping_option.amount ?? null, error: null }
  } catch (error) {
    console.error('Failed to calculate shipping price:', error)
    return { amount: null, error: 'Failed to calculate the delivery price.' }
  }
}
