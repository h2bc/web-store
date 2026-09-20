'use client'

import { useEffect } from 'react'
import { trackProductViewed } from '@/lib/analytics'

interface TrackProductViewedProps {
  slug: string
  name: string
  price?: number
  currency?: string
}

export default function TrackProductViewed({
  slug,
  name,
  price,
  currency,
}: TrackProductViewedProps) {
  useEffect(() => {
    trackProductViewed({ slug, name }, { price, currency })
  }, [slug, name, price, currency])

  return null
}
