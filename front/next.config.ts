import type { NextConfig } from 'next'

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
  images: imagesConfig,
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
