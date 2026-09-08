import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

type ProductCardImageProps = Omit<
  ImageProps,
  'alt' | 'className' | 'src' | 'fill' | 'priority'
> & {
  src: ImageProps['src']
  alt: string
  hoverSrc?: ImageProps['src']
  hoverAlt?: string
  className?: string
  imageClassName?: string
  hoverImageClassName?: string
}

export default function ProductCardImage({
  src,
  alt,
  hoverSrc,
  hoverAlt,
  className,
  imageClassName,
  hoverImageClassName,
  ...props
}: ProductCardImageProps) {
  return (
    <span
      className={cn(
        'group/product-card-image absolute inset-0 block h-full w-full [container-type:inline-size]',
        className
      )}
    >
      <Image
        {...props}
        fill
        src={src}
        alt={alt}
        className={cn(
          'pink-img-shadow object-contain',
          hoverSrc && 'group-hover/product-card-image:opacity-0',
          imageClassName
        )}
      />
      {hoverSrc && (
        <Image
          {...props}
          fill
          src={hoverSrc}
          alt={hoverAlt ?? alt}
          preload={false}
          loading="lazy"
          className={cn(
            'pink-img-shadow object-contain opacity-0 group-hover/product-card-image:opacity-100',
            hoverImageClassName
          )}
        />
      )}
    </span>
  )
}
