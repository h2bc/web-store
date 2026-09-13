import { describe, expect, it, vi } from 'vitest'
import { sdk } from '@/lib/medusa'
import { getCartId, setCartId } from '@/lib/cookies'
import { addItemToCart, getCart } from '@/lib/data/cart'
import {
  BACKEND_UNREACHABLE,
  CART_COMPLETED,
  CART_ID,
  CART_NOT_FOUND,
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

describe('adding a product', () => {
  it('first product: starts a cart and puts the product in it', async () => {
    vi.mocked(getCartId).mockResolvedValue(undefined)
    vi.mocked(sdk.store.cart.create).mockResolvedValue({ cart: NEW_CART })
    vi.mocked(sdk.store.cart.createLineItem).mockResolvedValue({
      cart: NEW_CART_WITH_ITEM,
    })

    const result = await addItemToCart(VARIANT_ID)

    expect(result.error).toBeNull()
    expect(result.cart?.items?.map((item) => item.variant_id)).toEqual([
      VARIANT_ID,
    ])
    expect(setCartId).toHaveBeenCalledWith(NEW_CART.id)
  })

  it("more than the stock: shows the backend's reason and keeps the cart", async () => {
    vi.mocked(getCartId).mockResolvedValue(CART_ID)
    vi.mocked(sdk.store.cart.createLineItem).mockRejectedValue(OUT_OF_STOCK)

    const result = await addItemToCart(VARIANT_ID)

    expect(result.cart).toBeNull()
    expect(result.error).toBe(OUT_OF_STOCK.message)
    expect(sdk.store.cart.create).not.toHaveBeenCalled()
  })
})

describe('adding a product with a stale cart cookie', () => {
  it.each([
    ['cart deleted behind the cookie', CART_NOT_FOUND],
    ['cart completed behind the cookie', CART_COMPLETED],
  ])('%s: puts the product in a new cart', async (_, staleError) => {
    vi.mocked(getCartId).mockResolvedValueOnce(STALE_CART_ID)
    vi.mocked(sdk.store.cart.create).mockResolvedValue({ cart: NEW_CART })
    vi.mocked(sdk.store.cart.createLineItem)
      .mockRejectedValueOnce(staleError)
      .mockResolvedValueOnce({ cart: NEW_CART_WITH_ITEM })

    const result = await addItemToCart(VARIANT_ID)

    expect(result.error).toBeNull()
    expect(result.cart?.items?.map((item) => item.variant_id)).toEqual([
      VARIANT_ID,
    ])
    expect(setCartId).toHaveBeenCalledWith(NEW_CART.id)
  })

  it('backend unreachable: shows an error and keeps the cookie', async () => {
    vi.mocked(getCartId).mockResolvedValue(STALE_CART_ID)
    vi.mocked(sdk.store.cart.createLineItem).mockRejectedValue(
      BACKEND_UNREACHABLE
    )

    const result = await addItemToCart(VARIANT_ID)

    expect(result.cart).toBeNull()
    expect(result.error).toBeTruthy()
    expect(setCartId).not.toHaveBeenCalled()
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
  it.each([
    ['cart deleted behind the cookie', CART_NOT_FOUND],
    ['cart completed behind the cookie', CART_COMPLETED],
  ])('%s: shows the empty cart and no error', async (_, staleError) => {
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(getCartId).mockResolvedValueOnce(undefined)
    const emptyCart = await getCart()

    vi.mocked(getCartId).mockResolvedValue(STALE_CART_ID)
    vi.mocked(sdk.store.cart.retrieve).mockRejectedValue(staleError)

    const result = await getCart()

    expect(result).toEqual(emptyCart)
    expect(logError).not.toHaveBeenCalled()
  })
})
