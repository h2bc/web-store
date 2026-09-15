export function getCartCookieOptions() {
  return {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }
}
