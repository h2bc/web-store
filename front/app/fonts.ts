import { UnifrakturMaguntia } from 'next/font/google'
import localFont from 'next/font/local'

export const unifraktur = UnifrakturMaguntia({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-unifraktur',
  preload: false,
})

export const edwardian = localFont({
  src: [
    {
      path: '../public/fonts/Edwardian Script ITC Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-edwardian',
  preload: false,
})
