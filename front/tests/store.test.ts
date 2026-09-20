import { describe, expect, it } from 'vitest'
import { getDefaultCountryCode } from '@/lib/store'
import {
  REGION_COUNTRY_CODES,
  TOR_COUNTRY,
  UNKNOWN_COUNTRY,
  UNSUPPORTED_COUNTRY,
} from './support/data'

describe('checkout default country', () => {
  it('starts a visitor from a shipped-to country on their own country', () => {
    const visitorCountry = 'DE'

    const countryCode = getDefaultCountryCode(
      visitorCountry,
      REGION_COUNTRY_CODES
    )

    expect(countryCode).toBe('de')
  })

  it('matches the visitor country whatever its letter case', () => {
    const visitorCountry = 'de'

    const countryCode = getDefaultCountryCode(
      visitorCountry,
      REGION_COUNTRY_CODES
    )

    expect(countryCode).toBe('de')
  })

  it.each([UNSUPPORTED_COUNTRY, UNKNOWN_COUNTRY, TOR_COUNTRY, null])(
    'starts a visitor from %s on Lithuania',
    (visitorCountry) => {
      const countryCodes = REGION_COUNTRY_CODES

      const countryCode = getDefaultCountryCode(visitorCountry, countryCodes)

      expect(countryCode).toBe('lt')
    }
  )
})
