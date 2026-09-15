'use server'

import { cookies } from 'next/headers'

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()

  return cookieStore.get('cart_id')?.value || undefined
}

export async function setCartId(cartId: string) {
  const cookieStore = await cookies()

  cookieStore.set('cart_id', cartId, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function removeCartId() {
  const cookieStore = await cookies()

  cookieStore.delete('cart_id')
}
