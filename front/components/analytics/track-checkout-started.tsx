'use client'

import { useEffect } from 'react'
import { trackCheckoutStarted } from '@/lib/analytics'

interface TrackCheckoutStartedProps {
  cartId: string
  cartValue: number
  currency: string
  itemCount: number
}

export default function TrackCheckoutStarted({
  cartId,
  cartValue,
  currency,
  itemCount,
}: TrackCheckoutStartedProps) {
  useEffect(() => {
    trackCheckoutStarted({
      cart_id: cartId,
      cart_value: cartValue,
      currency,
      item_count: itemCount,
    })
  }, [cartId, cartValue, currency, itemCount])

  return null
}
