'use server'

import { sdk } from '@/lib/medusa'
import { getCartId, setCartId, getRegionId } from '@/lib/cookies'
import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'

type CartResult = {
  cart: HttpTypes.StoreCart | null
  error: string | null
}

export async function getCart(): Promise<CartResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return {
      cart: null,
      error: 'No cart found',
    }
  }

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId)
    return {
      cart,
      error: null,
    }
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return {
      cart: null,
      error: 'Failed to load cart.',
    }
  }
}

export async function initCart(): Promise<CartResult> {
  const regionId = await getRegionId()

  if (!regionId) {
    return {
      cart: null,
      error: 'No region selected',
    }
  }

  try {
    const { cart } = await sdk.store.cart.create({
      region_id: regionId,
    })

    await setCartId(cart.id)

    return {
      cart,
      error: null,
    }
  } catch (error) {
    console.error('Failed to initialize cart:', error)
    return {
      cart: null,
      error: 'Failed to initialize cart.',
    }
  }
}

export async function addItemToCart(
  variantId: string,
  quantity: number = 1
): Promise<CartResult> {
  let cartId = await getCartId()

  // Initialize cart if it doesn't exist
  if (!cartId) {
    const { cart, error } = await initCart()
    if (error || !cart) {
      return {
        cart: null,
        error: error || 'Failed to initialize cart.',
      }
    }
    cartId = cart.id
  }

  try {
    const { cart } = await sdk.store.cart.createLineItem(cartId, {
      variant_id: variantId,
      quantity,
    })

    return {
      cart,
      error: null,
    }
  } catch (error) {
    const message =
      error instanceof FetchError && error.status === 400
        ? error.message
        : 'Failed to add item to cart.'

    return {
      cart: null,
      error: message,
    }
  }
}

export async function removeItemFromCart(itemId: string): Promise<CartResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return {
      cart: null,
      error: 'No cart found',
    }
  }

  try {
    const { parent: cart } = await sdk.store.cart.deleteLineItem(cartId, itemId)

    return {
      cart: cart || null,
      error: null,
    }
  } catch (error) {
    console.error('Failed to remove item from cart:', error)
    return {
      cart: null,
      error: 'Failed to remove item from cart.',
    }
  }
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return {
      cart: null,
      error: 'No cart found',
    }
  }

  try {
    const { cart } = await sdk.store.cart.updateLineItem(cartId, itemId, {
      quantity,
    })

    return {
      cart,
      error: null,
    }
  } catch (error) {
    const message =
      error instanceof FetchError && error.status === 400
        ? error.message
        : 'Failed to update cart item quantity.'

    return {
      cart: null,
      error: message,
    }
  }
}
