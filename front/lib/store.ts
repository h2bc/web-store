export const DEFAULT_COUNTRY_CODE = 'lt'

export function getDefaultCountryCode(
  visitorCountry: string | null,
  countryCodes: string[]
) {
  const visitorCode = visitorCountry?.toLowerCase()
  const shippedCodes = countryCodes.map((code) => code.toLowerCase())

  return visitorCode && shippedCodes.includes(visitorCode)
    ? visitorCode
    : DEFAULT_COUNTRY_CODE
}
