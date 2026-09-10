export const CHECKOUT_STEPS = ['address', 'delivery', 'payment'] as const

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number]
