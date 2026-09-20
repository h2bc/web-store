'use server'

import { revalidatePath } from 'next/cache'
import { sdk } from '@/lib/medusa'
import { getCartId, setCartId, removeCartId } from '@/lib/cookies'
import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import type { StripeAddressElementChangeEvent } from '@stripe/stripe-js'

type CheckoutContact = {
  email: string
  address: StripeAddressElementChangeEvent['value']
  analyticsConsent: boolean
}

type CartResult = {
  cart: HttpTypes.StoreCart | null
  error: string | null
}

const NO_CART: CartResult = { cart: null, error: 'No cart found' }

function isNotFound(error: unknown): boolean {
  return error instanceof FetchError && error.status === 404
}

function getAddItemError(error: unknown): string {
  return error instanceof FetchError && error.status === 400
    ? error.message
    : 'Failed to add item to cart.'
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

  if (!cartId) return NO_CART

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: '+shipping_methods.name',
    })

    if (cart.completed_at) return NO_CART

    return {
      cart: sortCartItems(cart),
      error: null,
    }
  } catch (error) {
    if (isNotFound(error)) return NO_CART

    console.error('Failed to fetch cart:', error)

    return {
      cart: null,
      error: 'Failed to load cart.',
    }
  }
}

async function createCart(): Promise<string> {
  const { cart } = await sdk.store.cart.create({})

  await setCartId(cart.id)

  return cart.id
}

async function getOpenCartId(): Promise<string> {
  const cartId = await getCartId()

  if (!cartId) return createCart()

  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, {
      fields: 'id,completed_at',
    })

    return cart.completed_at ? createCart() : cart.id
  } catch {
    return createCart()
  }
}

export async function addItemToCart(
  variantId: string,
  quantity: number = 1
): Promise<CartResult> {
  try {
    const { cart } = await sdk.store.cart.createLineItem(
      await getOpenCartId(),
      { variant_id: variantId, quantity }
    )

    return { cart: sortCartItems(cart), error: null }
  } catch (error) {
    return { cart: null, error: getAddItemError(error) }
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

export async function setCheckoutContact({
  email,
  address,
  analyticsConsent,
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
      metadata: { analytics_consent: analyticsConsent },
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

export async function completeCart(): Promise<string | null> {
  const cartId = await getCartId()

  if (!cartId) {
    console.error('Failed to complete cart: no cart_id cookie')

    return null
  }

  try {
    const result = await sdk.store.cart.complete(cartId)

    if (result.type !== 'order') {
      console.error('Failed to complete cart:', result.error)

      return null
    }

    await removeCartId()
    revalidatePath('/', 'layout')

    return result.order.id
  } catch (error) {
    console.error('Failed to complete cart:', error)

    return null
  }
}

export async function releaseCart(): Promise<void> {
  await removeCartId()
  revalidatePath('/', 'layout')
}
