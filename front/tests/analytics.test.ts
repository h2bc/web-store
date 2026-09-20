import { describe, expect, it } from 'vitest'
import { getCartEventProperties, getPostHogConfig } from '@/lib/analytics'
import {
  CHECKOUT_CART,
  FULL_TRACKING_OPTIONS,
  INGEST_PATH,
} from './support/data'

describe('analytics config', () => {
  it('sends everything through the shop and holds it until the visitor chooses', () => {
    const config = getPostHogConfig()

    expect(config.api_host).toEqual(INGEST_PATH)
    expect(config.cookieless_mode).toEqual('on_reject')
  })

  it('turns on every kind of tracking for a visitor who accepts', () => {
    const config = getPostHogConfig() as Record<string, unknown>

    expect(
      FULL_TRACKING_OPTIONS.filter((name) => config[name] !== true)
    ).toEqual([])
    expect(config.capture_performance).toEqual({
      network_timing: true,
      web_vitals: true,
    })
  })

  it('records the session unmasked except passwords', () => {
    const recording = getPostHogConfig().session_recording

    expect(recording?.maskAllInputs).toBe(false)
    expect(recording?.maskInputOptions?.password).toBe(true)
    expect(recording?.recordBody).toBe(true)
  })
})

describe('shop event', () => {
  it('carries the cart value, currency, country and shipping option', () => {
    const cart = CHECKOUT_CART

    const properties = getCartEventProperties(cart)

    expect(properties).toEqual({
      cart_value: 59.9,
      currency: 'eur',
      country: 'lt',
      shipping_option: 'Standard Shipping LT',
      item_count: 3,
    })
  })
})
