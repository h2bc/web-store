import { describe, expect, it } from 'vitest'
import nextConfig from '@/next.config'
import { POSTHOG_REWRITES } from './support/data'

describe('next config', () => {
  it('does not name the framework in page responses', () => {
    const config = nextConfig

    const poweredByHeader = config.poweredByHeader

    expect(poweredByHeader).toBe(false)
  })

  it('forwards analytics requests to the PostHog EU cloud', async () => {
    const config = nextConfig

    const rewrites = await config.rewrites?.()

    expect(rewrites).toEqual(POSTHOG_REWRITES)
    expect(config.skipTrailingSlashRedirect).toBe(true)
  })
})
