export const PAGE_URL = 'http://localhost:3000/'

export const S3_FILE_URL = 'https://files.example.com'

export const STATIC_ASSET_URL = 'http://localhost:3000/_next/static/chunk.js'

export const SECURITY_HEADERS = [
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'strict-transport-security',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
]

export const STRIPE_SCRIPT_ORIGINS = [
  'https://js.stripe.com',
  'https://*.js.stripe.com',
]

export const FRAME_ORIGINS = [
  ...STRIPE_SCRIPT_ORIGINS,
  'https://hooks.stripe.com',
  'https://www.youtube.com',
]

export const LOCKDOWN_DIRECTIVES = [
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]

export function getDirective(policy: string, name: string): string[] {
  const directive = policy
    .split(';')
    .map((part) => part.trim().split(/\s+/))
    .find(([directiveName]) => directiveName === name)

  return directive?.slice(1) ?? []
}

export function getNonce(policy: string): string | undefined {
  return getDirective(policy, 'script-src')
    .find((source) => source.startsWith("'nonce-"))
    ?.slice("'nonce-".length, -1)
}
