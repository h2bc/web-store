import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { config, proxy } from '@/proxy'
import {
  FORGED_POLICY,
  FRAME_ORIGINS,
  getDirective,
  getNonce,
  LOCKDOWN_DIRECTIVES,
  PAGE_URL,
  S3_FILE_URL,
  SECURITY_HEADERS,
  STATIC_ASSET_URL,
  STRIPE_SCRIPT_ORIGINS,
} from './support/security-headers'

describe('security headers', () => {
  it('protects every page with the security headers', () => {
    const request = new NextRequest(PAGE_URL)

    const response = proxy(request)

    expect(
      SECURITY_HEADERS.filter((name) => !response.headers.has(name))
    ).toEqual([])
  })

  it("runs only the storefront's own scripts and Stripe", () => {
    const request = new NextRequest(PAGE_URL)

    const policy = proxy(request).headers.get('content-security-policy') ?? ''
    const scriptSrc = getDirective(policy, 'script-src')

    expect(getNonce(policy)).toBeTruthy()
    expect(scriptSrc).toEqual(
      expect.arrayContaining([
        "'strict-dynamic'",
        "'wasm-unsafe-eval'",
        ...STRIPE_SCRIPT_ORIGINS,
      ])
    )
    expect(scriptSrc).not.toContain("'unsafe-inline'")
  })

  it('gives every page view its own script permission', () => {
    const request = new NextRequest(PAGE_URL)

    const first = proxy(request).headers.get('content-security-policy') ?? ''
    const second = proxy(request).headers.get('content-security-policy') ?? ''

    expect(getNonce(first)).not.toEqual(getNonce(second))
  })

  it('ignores a content policy the visitor sends with the request', () => {
    const request = new NextRequest(PAGE_URL, {
      headers: { 'content-security-policy': FORGED_POLICY },
    })

    const response = proxy(request)

    expect(
      response.headers.get('x-middleware-request-content-security-policy')
    ).toEqual(response.headers.get('content-security-policy'))
  })

  it('allows the Stripe and YouTube frames, the Stripe API and the S3 host', () => {
    vi.stubEnv('S3_FILE_URL', S3_FILE_URL)
    const request = new NextRequest(PAGE_URL)

    const policy = proxy(request).headers.get('content-security-policy') ?? ''

    expect(getDirective(policy, 'frame-src')).toEqual(
      expect.arrayContaining(FRAME_ORIGINS)
    )
    expect(getDirective(policy, 'connect-src')).toContain(
      'https://api.stripe.com'
    )
    expect(getDirective(policy, 'img-src')).toContain(S3_FILE_URL)
    expect(getDirective(policy, 'style-src')).toContain("'unsafe-inline'")
  })

  it('forbids framing, plugins and foreign form targets', () => {
    const request = new NextRequest(PAGE_URL)

    const policy = proxy(request).headers.get('content-security-policy') ?? ''

    expect(
      LOCKDOWN_DIRECTIVES.filter((rule) => !policy.includes(rule))
    ).toEqual([])
  })

  it('serves images, fonts and scripts without the page headers', () => {
    const url = STATIC_ASSET_URL

    const matches = unstable_doesMiddlewareMatch({ config, url })

    expect(matches).toBe(false)
  })
})
