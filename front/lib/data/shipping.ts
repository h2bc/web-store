'use server'

import { sdk } from '@/lib/medusa'
import { getCartId } from '@/lib/cookies'
import type { HttpTypes } from '@medusajs/types'

export type ShippingOptionSummary = {
  id: string
  name: string
  amount: number | null
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
        })
      ),
      error: null,
    }
  } catch (error) {
    console.error('Failed to fetch shipping options:', error)
    return { options: [], error: 'Failed to load delivery options.' }
  }
}
