import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { SITE_NAME } from '@/lib/seo'

export const alt = SITE_NAME
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const FONT_PATH = join(
  process.cwd(),
  'public/fonts/UnifrakturMaguntia-Regular.ttf'
)

async function loadBlackletter(): Promise<ArrayBuffer | null> {
  try {
    const buffer = await readFile(FONT_PATH)
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer
  } catch (error) {
    console.error('Open Graph image: falling back to system font:', error)
    return null
  }
}

export default async function OpenGraphImage() {
  const font = await loadBlackletter()

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: font ? 'Blackletter' : 'serif',
      }}
    >
      <div
        style={{
          fontSize: 280,
          lineHeight: 1,
          textShadow: '0 0 48px rgba(236, 72, 153, 0.9)',
        }}
      >
        {SITE_NAME}
      </div>
    </div>,
    {
      ...size,
      fonts: font
        ? [{ name: 'Blackletter', data: font, style: 'normal', weight: 400 }]
        : [],
    }
  )
}
