'use server'

import { sdk } from '@/lib/medusa'
import type { HttpTypes } from '@medusajs/types'

type OrderResult = {
  order: HttpTypes.StoreOrder | null
  error: string | null
}

export async function getOrder(id: string): Promise<OrderResult> {
  try {
    const { order } = await sdk.store.order.retrieve(id)

    return { order, error: null }
  } catch (error) {
    console.error('Failed to fetch order:', error)

    return { order: null, error: 'Failed to load your order.' }
  }
}
