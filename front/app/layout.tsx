import type { Metadata } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { unifraktur, edwardian } from './fonts'

export const metadata: Metadata = {
  title: { default: 'h2bc', template: '%s | h2bc' },
  description: 'culture | culture | culture',
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
