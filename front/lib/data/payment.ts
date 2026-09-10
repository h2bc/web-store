'use server'

import { sdk } from '@/lib/medusa'
import { getCartId } from '@/lib/cookies'
import type { HttpTypes } from '@medusajs/types'
import { STRIPE_PROVIDER_ID, getClientSecret } from '@/lib/payment-provider'

type PaymentSessionResult = {
  clientSecret: string | null
  error: string | null
}

async function createStripeSession(
  cart: HttpTypes.StoreCart
): Promise<string | null> {
  const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
    cart,
    {
      provider_id: STRIPE_PROVIDER_ID,
      data: { payment_method_types: ['card'] },
    }
  )

  const session = payment_collection.payment_sessions?.find(
    (s) => s.provider_id === STRIPE_PROVIDER_ID
  )
  const clientSecret = session?.data?.client_secret

  return typeof clientSecret === 'string' ? clientSecret : null
}

export async function initiateStripeSession(): Promise<PaymentSessionResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return { clientSecret: null, error: 'No cart found' }
  }

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId)
    const clientSecret =
      getClientSecret(cart) ?? (await createStripeSession(cart))

    if (!clientSecret) {
      return {
        clientSecret: null,
        error: 'Could not start the payment. Please try again.',
      }
    }

    return { clientSecret, error: null }
  } catch (error) {
    console.error('Failed to initiate payment session:', error)
    return {
      clientSecret: null,
      error: 'Could not start the payment. Please try again.',
    }
  }
}
