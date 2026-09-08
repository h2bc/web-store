'use server'

import { sdk } from '@/lib/medusa'
import { getCartId } from '@/lib/cookies'
import { STRIPE_PROVIDER_ID, getClientSecret } from '@/lib/payment-provider'

type PaymentSessionResult = {
  clientSecret: string | null
  error: string | null
}

export async function initiateStripeSession(): Promise<PaymentSessionResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return { clientSecret: null, error: 'No cart found' }
  }

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId)

    const existing = getClientSecret(cart)
    if (existing) {
      return { clientSecret: existing, error: null }
    }

    const { payment_collection } =
      await sdk.store.payment.initiatePaymentSession(cart, {
        provider_id: STRIPE_PROVIDER_ID,
      })

    const session = payment_collection.payment_sessions?.find(
      (s) => s.provider_id === STRIPE_PROVIDER_ID
    )
    const clientSecret = session?.data?.client_secret

    if (typeof clientSecret !== 'string') {
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
