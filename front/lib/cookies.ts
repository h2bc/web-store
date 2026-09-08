'use server'

import { cookies } from 'next/headers'

export async function getRegionId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('region_id')?.value
}

export async function setRegionId(regionId: string) {
  const cookieStore = await cookies()
  cookieStore.set('region_id', regionId, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
  })
}

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('cart_id')?.value
}

export async function setCartId(cartId: string) {
  const cookieStore = await cookies()
  cookieStore.set('cart_id', cartId, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
  })
}

export async function removeCartId() {
  const cookieStore = await cookies()
  cookieStore.delete('cart_id')
}
