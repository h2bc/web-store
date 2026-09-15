'use server'

import { cookies } from 'next/headers'
import { getCartCookieOptions } from '@/lib/cart-cookie'

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()

  return cookieStore.get('cart_id')?.value || undefined
}

export async function setCartId(cartId: string) {
  const cookieStore = await cookies()

  cookieStore.set('cart_id', cartId, getCartCookieOptions())
}

export async function removeCartId() {
  const cookieStore = await cookies()

  cookieStore.delete('cart_id')
}
