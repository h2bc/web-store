import type { HttpTypes } from '@medusajs/types'

export const STRIPE_PROVIDER_ID = 'pp_stripe_stripe'

function stripeSessions(cart: HttpTypes.StoreCart) {
  return (cart.payment_collection?.payment_sessions ?? []).filter(
    (s) => s.provider_id === STRIPE_PROVIDER_ID
  )
}

export function getClientSecret(cart: HttpTypes.StoreCart): string | null {
  const session = stripeSessions(cart).find((s) => s.status === 'pending')
  const secret = session?.data?.client_secret

  return typeof secret === 'string' ? secret : null
}

export function cartOwnsClientSecret(
  cart: HttpTypes.StoreCart,
  clientSecret: string
): boolean {
  return stripeSessions(cart).some(
    (s) => s.data?.client_secret === clientSecret
  )
}
