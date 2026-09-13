import { FetchError } from '@medusajs/js-sdk'
import type { HttpTypes } from '@medusajs/types'
import type { ContentPage } from '@/lib/types/content-page'

export const TERMS: ContentPage = {
  slug: 'terms',
  title: 'Terms',
  description: 'How we sell and ship.',
  body: '## Orders\n\nEvery order is final.',
  updatedAt: '2026-09-12T00:00:00.000Z',
}

export const TERMS_UNTITLED: ContentPage = { ...TERMS, title: null }

export const STALE_CART_ID = 'cart_stale'

export const VARIANT_ID = 'variant_tee_m'

export const NEW_CART = {
  id: 'cart_new',
  items: [],
} as unknown as HttpTypes.StoreCart

export const NEW_CART_WITH_ITEM = {
  ...NEW_CART,
  items: [{ id: 'item_1', variant_id: VARIANT_ID, quantity: 1 }],
} as unknown as HttpTypes.StoreCart

export const CART_NOT_FOUND = new FetchError(
  `Cart with id '${STALE_CART_ID}' not found`,
  'Not Found',
  404
)

export const CART_COMPLETED = new FetchError(
  `Cart ${STALE_CART_ID} is already completed.`,
  'Bad Request',
  400
)

export const BACKEND_UNREACHABLE = new TypeError('fetch failed')

export const CART_ID = 'cart_live'

export const OUT_OF_STOCK = new FetchError(
  `Variant ${VARIANT_ID} does not have the required inventory`,
  'Bad Request',
  400
)

export const UNSORTED_CART = {
  id: CART_ID,
  items: [
    { id: 'item_tee_m', product_title: 'Meduza Tee', variant_title: 'M' },
    { id: 'item_beanie', product_title: 'Beanie', variant_title: 'ONESIZE' },
    { id: 'item_tee_l', product_title: 'Meduza Tee', variant_title: 'L' },
  ],
} as unknown as HttpTypes.StoreCart

export const SORTED_ITEM_IDS = ['item_beanie', 'item_tee_l', 'item_tee_m']
