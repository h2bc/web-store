import { FetchError } from '@medusajs/js-sdk'
import type { HttpTypes } from '@medusajs/types'
import type { ContactFormData } from '@/lib/schemas/contact'
import type { ContentPage } from '@/lib/types/content-page'

export const TERMS: ContentPage = {
  slug: 'terms',
  title: 'Terms',
  description: 'How we sell and ship.',
  body: '## Orders\n\nEvery order is final.',
  updatedAt: '2026-09-12T00:00:00.000Z',
}

export const TERMS_UNTITLED: ContentPage = { ...TERMS, title: null }

export const CONTACT_MESSAGE: ContactFormData = {
  name: 'Jonas',
  email: 'jonas@example.com',
  topic: 'returns',
  message: 'I would like to return my order.',
}

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

export const COMPLETED_CART = {
  id: STALE_CART_ID,
  completed_at: '2026-09-01T00:00:00.000Z',
  items: [],
} as unknown as HttpTypes.StoreCart

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

export const REGION_COUNTRY_CODES = ['DE', 'LT', 'LV']

export const UNSUPPORTED_COUNTRY = 'US'

export const UNKNOWN_COUNTRY = 'XX'

export const TOR_COUNTRY = 'T1'

export const CHECKOUT_CART = {
  id: CART_ID,
  total: 59.9,
  currency_code: 'eur',
  shipping_address: { country_code: 'lt' },
  shipping_methods: [{ name: 'Standard Shipping LT' }],
  items: [
    { id: 'item_beanie', quantity: 1 },
    { id: 'item_tee_m', quantity: 2 },
  ],
} as unknown as HttpTypes.StoreCart

export const CHECKOUT_CONTACT = {
  email: ' Buyer@Example.com ',
  address: {
    name: 'Jonas Jonaitis',
    firstName: 'Jonas',
    lastName: 'Jonaitis',
    phone: '',
    address: {
      line1: 'Gedimino pr. 1',
      line2: null,
      city: 'Vilnius',
      state: '',
      postal_code: '01103',
      country: 'LT',
    },
  },
}

export const INGEST_PATH = '/ingest'

export const INGEST_URL = 'http://localhost:3000/ingest/e/'

export const POSTHOG_REWRITES = [
  {
    source: '/ingest/static/:path*',
    destination: 'https://eu-assets.i.posthog.com/static/:path*',
  },
  {
    source: '/ingest/:path*',
    destination: 'https://eu.i.posthog.com/:path*',
  },
]

export const FULL_TRACKING_OPTIONS = [
  'autocapture',
  'enable_heatmaps',
  'capture_dead_clicks',
  'capture_exceptions',
  'enable_recording_console_log',
]
