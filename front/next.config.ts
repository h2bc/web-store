import type { NextConfig } from 'next'

const POSTHOG = {
  events: 'https://eu.i.posthog.com',
  assets: 'https://eu-assets.i.posthog.com',
}

let imagesConfig: NextConfig['images']

if (process.env.NODE_ENV === 'production') {
  imagesConfig = {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.h2bcweb.com',
        pathname: '/**',
      },
    ],
  }
} else {
  imagesConfig = {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/static/**',
      },
    ],
  }
}

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  turbopack: { root: __dirname },
  images: imagesConfig,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: `${POSTHOG.assets}/static/:path*`,
      },
      {
        source: '/ingest/:path*',
        destination: `${POSTHOG.events}/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
