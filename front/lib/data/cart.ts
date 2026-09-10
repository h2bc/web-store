'use server'

import { revalidatePath } from 'next/cache'
import { sdk } from '@/lib/medusa'
import {
  getCartId,
  setCartId,
  getRegionId,
  setRegionId,
  removeCartId,
} from '@/lib/cookies'
import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js'

type CheckoutContact = {
  email: string
  address: StripeAddressElementChangeEvent['value']
}

type CartResult = {
  cart: HttpTypes.StoreCart | null
  error: string | null
}

function sortCartItems(
  cart: HttpTypes.StoreCart | null
): HttpTypes.StoreCart | null {
  if (!cart?.items?.length) return cart

  return {
    ...cart,
    items: [...cart.items].sort((a, b) => {
      const productA = a.product_title ?? ''
      const productB = b.product_title ?? ''
      if (productA < productB) return -1
      if (productA > productB) return 1

      const variantA = a.variant_title ?? ''
      const variantB = b.variant_title ?? ''
      if (variantA < variantB) return -1
      if (variantA > variantB) return 1

      return 0
    }),
  }
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
      cart: sortCartItems(cart),
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

async function initCart(): Promise<CartResult> {
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
      cart: sortCartItems(cart),
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
      cart: sortCartItems(cart),
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
      cart: sortCartItems(cart || null),
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
      cart: sortCartItems(cart),
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

type CompleteCartResult = {
  orderId: string | null
  error: string | null
}

export async function setCheckoutContact({
  email,
  address,
}: CheckoutContact): Promise<CartResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return { cart: null, error: 'No cart found' }
  }

  if (!email || !address.address.line1 || !address.address.country) {
    return { cart: null, error: 'Please fill in your email and address.' }
  }

  const medusaAddress = {
    first_name: address.firstName,
    last_name: address.lastName,
    address_1: address.address.line1,
    address_2: address.address.line2 ?? undefined,
    city: address.address.city,
    postal_code: address.address.postal_code,
    country_code: address.address.country.toLowerCase(),
    province: address.address.state,
    phone: address.phone,
  }

  try {
    const { cart } = await sdk.store.cart.update(cartId, {
      email: email.trim().toLowerCase(),
      shipping_address: medusaAddress,
      billing_address: medusaAddress,
    })

    revalidatePath('/checkout')

    return { cart: sortCartItems(cart), error: null }
  } catch (error) {
    const message =
      error instanceof FetchError && error.status === 400
        ? error.message
        : 'Failed to save your address.'

    return { cart: null, error: message }
  }
}

export async function setShippingMethod(optionId: string): Promise<CartResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return { cart: null, error: 'No cart found' }
  }

  try {
    const { cart } = await sdk.store.cart.addShippingMethod(cartId, {
      option_id: optionId,
    })

    revalidatePath('/checkout')

    return { cart: sortCartItems(cart), error: null }
  } catch (error) {
    const message =
      error instanceof FetchError && error.status === 400
        ? error.message
        : 'Failed to set the delivery method.'

    return { cart: null, error: message }
  }
}

export async function completeCart(): Promise<CompleteCartResult> {
  const cartId = await getCartId()

  if (!cartId) {
    return { orderId: null, error: 'No cart found' }
  }

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId)
    if (cart.completed_at) {
      return { orderId: null, error: 'This order has already been placed.' }
    }
  } catch {
    return { orderId: null, error: 'Failed to load cart.' }
  }

  try {
    const result = await sdk.store.cart.complete(cartId)

    if (result.type !== 'order') {
      const message =
        typeof result.error?.message === 'string'
          ? result.error.message
          : 'Payment could not be completed. You have not been charged.'

      return { orderId: null, error: message }
    }

    await removeCartId()
    revalidatePath('/', 'layout')

    return { orderId: result.order.id, error: null }
  } catch (error) {
    console.error('Failed to complete cart:', error)
    return {
      orderId: null,
      error: 'Failed to place the order. You have not been charged.',
    }
  }
}

export async function changeRegion(regionId: string): Promise<void> {
  await setRegionId(regionId)

  const cartId = await getCartId()

  if (cartId) {
    try {
      await sdk.store.cart.update(cartId, { region_id: regionId })
    } catch (error) {
      console.error('Failed to move cart to new region:', error)
    }
  }

  revalidatePath('/', 'layout')
}
