import type { Metadata } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { unifraktur, edwardian } from './fonts'
import {
  OPEN_GRAPH_DEFAULTS,
  SITE_DESCRIPTION,
  SITE_NAME,
  isIndexable,
  siteUrl,
} from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    openGraph: OPEN_GRAPH_DEFAULTS,
    ...(isIndexable() ? {} : { robots: { index: false } }),
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          unifraktur.variable,
          edwardian.variable,
          'min-h-screen',
          'flex flex-col',
          'items-center'
        )}
      >
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  )
}
