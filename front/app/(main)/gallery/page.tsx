import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Videos from h2bc: drops, lookbooks and behind the scenes.',
  alternates: { canonical: '/gallery' },
}

const VIDEOS: { id: string; title: string }[] = [
  { id: 'srRVUe4_wW4', title: 'verkei?' },
  { id: 'C8Hkml0CRmo', title: 'meduza' },
  { id: 'qI8fDbBXW2s', title: '2DRIP' },
]

export default function GalleryPage() {
  return (
    <div className="space-y-16">
      {VIDEOS.map((v) => (
        <div
          key={v.id}
          className="relative w-full"
          style={{ aspectRatio: '16/9' }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1&color=white`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
  )
}
