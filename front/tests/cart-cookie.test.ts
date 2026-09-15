import { describe, expect, it, vi } from 'vitest'
import { getCartCookieOptions } from '@/lib/cart-cookie'
import { CART_COOKIE_FLAGS } from './support/security-headers'

describe('cart cookie', () => {
  it('keeps the cart cookie private to the storefront', () => {
    vi.stubEnv('NODE_ENV', 'production')

    const options = getCartCookieOptions()

    expect(options).toMatchObject({ ...CART_COOKIE_FLAGS, secure: true })
  })
})
