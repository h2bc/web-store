import posthog, { type PostHogConfig } from 'posthog-js'
import type { HttpTypes } from '@medusajs/types'

type EventProperties = Record<string, unknown>

type TrackedProduct = { slug: string; name: string }

type TrackedVariant = {
  id: string
  title: string
  price: number
  currency: string
}

type TrackedLineItem = {
  product_handle?: string | null
  product_title?: string | null
  variant_id?: string | null
  variant_title?: string | null
  unit_price: number
  quantity: number
}

type Shopper = { email: string; name: string; country: string }

export function getPostHogConfig(): Partial<PostHogConfig> {
  return {
    api_host: '/ingest',
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-08-30',
    cookieless_mode: 'on_reject',
    person_profiles: 'always',
    autocapture: true,
    enable_heatmaps: true,
    capture_dead_clicks: true,
    capture_exceptions: true,
    capture_performance: { network_timing: true, web_vitals: true },
    enable_recording_console_log: true,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
      recordHeaders: true,
      recordBody: true,
    },
  }
}

export function startAnalytics(apiKey: string) {
  if (typeof window === 'undefined' || posthog.__loaded) return

  posthog.init(apiKey, getPostHogConfig())
}

export function isConsentPending(): boolean {
  return posthog.__loaded && posthog.get_explicit_consent_status() === 'pending'
}

export function hasAnalyticsConsent(): boolean {
  return posthog.__loaded && posthog.get_explicit_consent_status() === 'granted'
}

export function acceptAnalytics() {
  posthog.opt_in_capturing()
}

export function declineAnalytics() {
  posthog.opt_out_capturing()
}

export function identifyShopper({ email, name, country }: Shopper) {
  if (!hasAnalyticsConsent()) return

  posthog.identify(email.trim().toLowerCase(), { email, name, country })
}

export function getCartEventProperties(
  cart: HttpTypes.StoreCart
): EventProperties {
  return {
    cart_value: cart.total,
    currency: cart.currency_code,
    country: cart.shipping_address?.country_code,
    shipping_option: cart.shipping_methods?.[0]?.name,
    item_count: (cart.items ?? []).reduce(
      (count, item) => count + item.quantity,
      0
    ),
  }
}

function trackEvent(event: string, properties: EventProperties) {
  if (!posthog.__loaded) return

  posthog.capture(event, properties)
}

function getVariantProperties(
  product: TrackedProduct,
  variant: TrackedVariant
): EventProperties {
  return {
    product: product.name,
    product_slug: product.slug,
    variant_id: variant.id,
    variant: variant.title,
    price: variant.price,
    currency: variant.currency,
  }
}

export function trackProductViewed(
  product: TrackedProduct,
  variant: Pick<Partial<TrackedVariant>, 'price' | 'currency'>
) {
  trackEvent('product_viewed', {
    product: product.name,
    product_slug: product.slug,
    price: variant.price,
    currency: variant.currency,
  })
}

export function trackAddedToCart(
  product: TrackedProduct,
  variant: TrackedVariant,
  quantity: number
) {
  trackEvent('added_to_cart', {
    ...getVariantProperties(product, variant),
    quantity,
  })
}

export function trackRemovedFromCart(item: TrackedLineItem, currency?: string) {
  trackEvent('removed_from_cart', {
    product: item.product_title,
    product_slug: item.product_handle,
    variant_id: item.variant_id,
    variant: item.variant_title,
    price: item.unit_price,
    quantity: item.quantity,
    currency,
  })
}

export function trackCheckoutStarted(properties: EventProperties) {
  trackEvent('checkout_started', properties)
}

export function trackCheckoutStepCompleted(
  step: 'address' | 'delivery',
  cart: HttpTypes.StoreCart
) {
  trackEvent('checkout_step_completed', {
    step,
    ...getCartEventProperties(cart),
  })
}

export function trackPaymentFailed(
  reason: string | undefined,
  properties: EventProperties
) {
  trackEvent('payment_failed', { reason, ...properties })
}
