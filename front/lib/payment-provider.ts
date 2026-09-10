import type { HttpTypes } from '@medusajs/types'

export const STRIPE_PROVIDER_ID = 'pp_stripe_stripe'

export function getClientSecret(cart: HttpTypes.StoreCart): string | null {
  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === STRIPE_PROVIDER_ID && s.status === 'pending'
  )
  const secret = session?.data?.client_secret
  return typeof secret === 'string' ? secret : null
}
