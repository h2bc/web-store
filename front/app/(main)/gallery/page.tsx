import type { Metadata } from 'next'
import ErrorAlert from '@/components/feedback/error-alert'
import { getGalleryVideos } from '@/lib/data/gallery'

const GALLERY_METADATA: Metadata = {
  title: 'Gallery',
  description: 'Videos from h2bc: drops, lookbooks and behind the scenes.',
}

export async function generateMetadata(): Promise<Metadata> {
  const { error } = await getGalleryVideos()

  if (error) {
    return { ...GALLERY_METADATA, robots: { index: false } }
  }

  return { ...GALLERY_METADATA, alternates: { canonical: '/gallery' } }
}

export default async function GalleryPage() {
  const { videos, error } = await getGalleryVideos()

  if (error) {
    return (
      <div className="flex justify-center pt-15">
        <ErrorAlert message={error} />
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <p className="text-center pt-15 text-muted-foreground">No videos yet</p>
    )
  }

  return (
    <div className="space-y-16">
      {videos.map((video) => (
        <div
          key={video.id}
          className="relative w-full"
          style={{ aspectRatio: '16/9' }}
        >
          <iframe
            src={video.url}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
  )
}
