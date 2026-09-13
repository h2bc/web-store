import 'server-only'
import { cache } from 'react'
import { sdk } from '@/lib/medusa'
import { cached } from '@/lib/cache'
import type { GalleryVideo } from '@/lib/types/gallery'

const CACHE_REVALIDATE_TIME = 60

type GalleryResult = { videos: GalleryVideo[]; error: string | null }

const fetchGalleryVideos = cached(
  async (): Promise<GalleryVideo[]> => {
    const { videos } = await sdk.client.fetch<{ videos: GalleryVideo[] }>(
      '/store/gallery'
    )

    return videos
  },
  ['gallery'],
  { revalidate: CACHE_REVALIDATE_TIME, tags: ['gallery'] }
)

export const getGalleryVideos = cache(async (): Promise<GalleryResult> => {
  try {
    return { videos: await fetchGalleryVideos(), error: null }
  } catch (error) {
    console.error('Failed to fetch gallery videos:', error)

    return { videos: [], error: 'Failed to load the gallery' }
  }
})
