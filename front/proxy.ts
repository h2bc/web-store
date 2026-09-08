import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const regionId = request.cookies.get('region_id')?.value

  if (!regionId) {
    const defaultRegionId = process.env.NEXT_PUBLIC_DEFAULT_REGION_ID
    if (!defaultRegionId) {
      throw new Error('NEXT_PUBLIC_DEFAULT_REGION_ID is not set')
    }
    response.cookies.set('region_id', defaultRegionId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
