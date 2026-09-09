import Link from 'next/link'
import ProductCardImage from '@/components/shop/product-card-image'
import { cn, formatPrice } from '@/lib/utils'
import { screens } from '@/lib/breakpoints'
import type { ProductItem } from '@/lib/types/product'
import { productPath } from '@/lib/routes'

interface ProductCardProps extends Omit<ProductItem, 'category'> {
  preload?: boolean
  enableHoverImage?: boolean
}

export default function ProductCard({
  slug,
  name,
  price,
  image,
  hoverImage,
  soldOut,
  preload,
  currencyCode,
  enableHoverImage = true,
}: ProductCardProps) {
  const href = productPath(slug)
  const showHoverImage = !!hoverImage && enableHoverImage

  return (
    <div className="group w-full max-w-sm mx-auto">
      <Link href={href} aria-label={`View ${name}`} className="block">
        <div className={`relative w-full aspect-square`}>
          <div
            className={cn('relative w-full h-full', soldOut && 'opacity-40')}
          >
            <ProductCardImage
              src={image}
              alt={name}
              hoverSrc={showHoverImage ? hoverImage : undefined}
              sizes={`(min-width:${screens.xl}) 25vw, (min-width:${screens.lg}) 33vw, (min-width:${screens.sm}) 50vw, 100vw`}
              draggable={false}
              preload={!!preload}
            />
          </div>
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-script text-foreground/90 text-5xl select-none">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 text-center">
        <Link
          href={href}
          className="inline-block group-hover:underline text-lg tracking-wide"
        >
          {name}
        </Link>
      </div>
      <div className="mt-1 text-center text-base font-medium">
        {formatPrice(price, currencyCode)}
      </div>
    </div>
  )
}
