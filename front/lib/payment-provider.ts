import type { HttpTypes } from '@medusajs/types'

export const STRIPE_PROVIDER_ID = 'pp_stripe_stripe'

export function findStripeSession(cart: HttpTypes.StoreCart) {
  const sessions = cart.payment_collection?.payment_sessions ?? []

  return (
    sessions.find(
      (session) =>
        session.provider_id === STRIPE_PROVIDER_ID &&
        session.status === 'pending'
    ) ?? null
  )
}

export function getClientSecret(cart: HttpTypes.StoreCart): string | null {
  const secret = findStripeSession(cart)?.data?.client_secret
  return typeof secret === 'string' ? secret : null
}
