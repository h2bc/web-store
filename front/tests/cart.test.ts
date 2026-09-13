import { describe, expect, it, vi } from 'vitest'
import { sdk } from '@/lib/medusa'
import { getCartId } from '@/lib/cookies'
import { addItemToCart, getCart } from '@/lib/data/cart'
import {
  BACKEND_UNREACHABLE,
  CART_ID,
  CART_NOT_FOUND,
  COMPLETED_CART,
  NEW_CART,
  NEW_CART_WITH_ITEM,
  OUT_OF_STOCK,
  SORTED_ITEM_IDS,
  STALE_CART_ID,
  UNSORTED_CART,
  VARIANT_ID,
} from './support/data'

vi.mock('@/lib/medusa', () => ({
  sdk: {
    store: {
      cart: { retrieve: vi.fn(), create: vi.fn(), createLineItem: vi.fn() },
    },
  },
}))

vi.mock('@/lib/cookies', () => ({
  getCartId: vi.fn(),
  setCartId: vi.fn(),
  removeCartId: vi.fn(),
}))

function getVariantIds(result: Awaited<ReturnType<typeof addItemToCart>>) {
  return result.cart?.items?.map((item) => item.variant_id)
}

describe('adding a product', () => {
  it('first product: starts a cart and puts the product in it', async () => {
    vi.mocked(getCartId).mockResolvedValue(undefined)
    vi.mocked(sdk.store.cart.create).mockResolvedValue({ cart: NEW_CART })
    vi.mocked(sdk.store.cart.createLineItem).mockResolvedValue({
      cart: NEW_CART_WITH_ITEM,
    })

    const result = await addItemToCart(VARIANT_ID)

    expect(result.error).toBeNull()
    expect(result.cart?.id).toBe(NEW_CART.id)
    expect(getVariantIds(result)).toEqual([VARIANT_ID])
  })

  it("more than the stock: shows the backend's reason", async () => {
    vi.mocked(getCartId).mockResolvedValue(CART_ID)
    vi.mocked(sdk.store.cart.retrieve).mockResolvedValue({
      cart: UNSORTED_CART,
    })
    vi.mocked(sdk.store.cart.createLineItem).mockRejectedValue(OUT_OF_STOCK)

    const result = await addItemToCart(VARIANT_ID)

    expect(result.cart).toBeNull()
    expect(result.error).toBe(OUT_OF_STOCK.message)
  })
})

describe('adding a product with a stale cart cookie', () => {
  it('cart deleted behind the cookie: puts the product in a new cart', async () => {
    vi.mocked(getCartId).mockResolvedValue(STALE_CART_ID)
    vi.mocked(sdk.store.cart.retrieve).mockRejectedValue(CART_NOT_FOUND)
    vi.mocked(sdk.store.cart.create).mockResolvedValue({ cart: NEW_CART })
    vi.mocked(sdk.store.cart.createLineItem).mockResolvedValue({
      cart: NEW_CART_WITH_ITEM,
    })

    const result = await addItemToCart(VARIANT_ID)

    expect(result.error).toBeNull()
    expect(result.cart?.id).toBe(NEW_CART.id)
    expect(getVariantIds(result)).toEqual([VARIANT_ID])
  })

  it('cart completed behind the cookie: puts the product in a new cart', async () => {
    vi.mocked(getCartId).mockResolvedValue(STALE_CART_ID)
    vi.mocked(sdk.store.cart.retrieve).mockResolvedValue({
      cart: COMPLETED_CART,
    })
    vi.mocked(sdk.store.cart.create).mockResolvedValue({ cart: NEW_CART })
    vi.mocked(sdk.store.cart.createLineItem).mockResolvedValue({
      cart: NEW_CART_WITH_ITEM,
    })

    const result = await addItemToCart(VARIANT_ID)

    expect(result.error).toBeNull()
    expect(result.cart?.id).toBe(NEW_CART.id)
    expect(getVariantIds(result)).toEqual([VARIANT_ID])
  })

  it('backend unreachable: shows an error', async () => {
    vi.mocked(getCartId).mockResolvedValue(STALE_CART_ID)
    vi.mocked(sdk.store.cart.retrieve).mockRejectedValue(BACKEND_UNREACHABLE)
    vi.mocked(sdk.store.cart.create).mockRejectedValue(BACKEND_UNREACHABLE)

    const result = await addItemToCart(VARIANT_ID)

    expect(result.cart).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

describe('reading the cart', () => {
  it('items are listed by product, then by size', async () => {
    vi.mocked(getCartId).mockResolvedValue(CART_ID)
    vi.mocked(sdk.store.cart.retrieve).mockResolvedValue({
      cart: UNSORTED_CART,
    })

    const result = await getCart()

    expect(result.cart?.items?.map((item) => item.id)).toEqual(SORTED_ITEM_IDS)
  })

  it('backend unreachable: shows a load error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getCartId).mockResolvedValue(CART_ID)
    vi.mocked(sdk.store.cart.retrieve).mockRejectedValue(BACKEND_UNREACHABLE)

    const result = await getCart()

    expect(result.cart).toBeNull()
    expect(result.error).toBeTruthy()
  })
})

describe('reading the cart with a stale cart cookie', () => {
  it('cart deleted behind the cookie: shows the empty cart', async () => {
    vi.mocked(sdk.store.cart.retrieve).mockRejectedValue(CART_NOT_FOUND)
    vi.mocked(getCartId)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(STALE_CART_ID)
    const emptyCart = await getCart()

    const result = await getCart()

    expect(result).toEqual(emptyCart)
  })

  it('cart completed behind the cookie: shows the empty cart', async () => {
    vi.mocked(sdk.store.cart.retrieve).mockResolvedValue({
      cart: COMPLETED_CART,
    })
    vi.mocked(getCartId)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(STALE_CART_ID)
    const emptyCart = await getCart()

    const result = await getCart()

    expect(result).toEqual(emptyCart)
  })
})
