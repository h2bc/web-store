import { describe, expect, it } from 'vitest'
import nextConfig from '@/next.config'

describe('next config', () => {
  it('does not name the framework in page responses', () => {
    const config = nextConfig

    const poweredByHeader = config.poweredByHeader

    expect(poweredByHeader).toBe(false)
  })
})
