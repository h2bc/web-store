import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  font?: 'sans' | 'blackletter' | 'script'
  bold?: boolean
  className?: string
}

export default function Heading({
  children,
  level = 1,
  font = 'sans',
  bold = false,
  className = '',
}: HeadingProps) {
  const fontClasses = {
    sans: 'font-sans',
    blackletter: 'font-blackletter',
    script: 'font-script',
  }

  const defaultSizes = {
    1: 'text-3xl sm:text-4xl lg:text-5xl',
    2: 'text-2xl sm:text-3xl lg:text-4xl',
    3: 'text-xl sm:text-2xl lg:text-3xl',
    4: 'text-lg sm:text-xl lg:text-2xl',
    5: 'text-base sm:text-lg',
    6: 'text-sm',
  }

  const baseClasses = twMerge(
    fontClasses[font],
    defaultSizes[level],
    'tracking-wide',
    bold ? 'font-bold' : '',
    className
  )

  switch (level) {
    case 1:
      return <h1 className={baseClasses}>{children}</h1>
    case 2:
      return <h2 className={baseClasses}>{children}</h2>
    case 3:
      return <h3 className={baseClasses}>{children}</h3>
    case 4:
      return <h4 className={baseClasses}>{children}</h4>
    case 5:
      return <h5 className={baseClasses}>{children}</h5>
    case 6:
      return <h6 className={baseClasses}>{children}</h6>
    default:
      return <h1 className={baseClasses}>{children}</h1>
  }
}
