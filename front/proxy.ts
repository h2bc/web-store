import { NextResponse, type NextRequest } from 'next/server'

const isProduction = process.env.NODE_ENV === 'production'

const STRIPE_JS = ['https://js.stripe.com', 'https://*.js.stripe.com']

const STRIPE = {
  scripts: STRIPE_JS,
  frames: [...STRIPE_JS, 'https://hooks.stripe.com'],
  connections: ['https://api.stripe.com'],
}

const YOUTUBE = { frames: ['https://www.youtube.com'] }

const LOCAL_API = isProduction ? [] : ['http://localhost:9000']
const FIXED_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-site',
}

function getNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

function getPolicy(nonce: string): string {
  const s3 = process.env.S3_FILE_URL
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "'wasm-unsafe-eval'",
      ...(isProduction ? [] : ["'unsafe-eval'"]),
      ...STRIPE.scripts,
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'blob:', 'data:', ...(s3 ? [s3] : []), ...LOCAL_API],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...STRIPE.connections],
    'frame-src': [...STRIPE.frames, ...YOUTUBE.frames],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  }

  return Object.entries(directives)
    .map(([name, sources]) => [name, ...sources].join(' '))
    .join('; ')
}

export function proxy(request: NextRequest) {
  const nonce = getNonce()
  const policy = getPolicy(nonce)
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('Content-Security-Policy', policy)

  return NextResponse.next({
    request: { headers: requestHeaders },
    headers: { 'Content-Security-Policy': policy, ...FIXED_HEADERS },
  })
}

export const config = {
  matcher: [
    {
      source: '/((?!api|ingest|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
