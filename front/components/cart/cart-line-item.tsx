'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import ProductCardImage from '@/components/shop/product-card-image'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { HttpTypes } from '@medusajs/types'
import { Button } from '@/components/ui/button'
import Stepper from '@/components/ui/stepper'
import { removeItemFromCart, updateItemQuantity } from '@/lib/data/cart'
import { formatPrice } from '@/lib/utils'
import { productPath } from '@/lib/routes'

interface CartLineItemProps {
  item: HttpTypes.StoreCartLineItem
  currencyCode?: string
  onRemoveSuccess?: () => void
  onNavigate?: () => void
  imageSize?: 'sm' | 'md'
  /** Hides the quantity stepper and remove button (used during checkout). */
  readOnly?: boolean
}

const imageSizeConfig = {
  sm: { containerClass: 'w-20 h-20', sizes: '80px' },
  md: { containerClass: 'w-24 h-24', sizes: '96px' },
} as const

export default function CartLineItem({
  item,
  currencyCode,
  onRemoveSuccess,
  onNavigate,
  imageSize = 'md',
  readOnly = false,
}: CartLineItemProps) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity)
  const [isPending, startTransition] = useTransition()

  const thumbnail = item.thumbnail
  const title = item.product_title
  const subtitle = item.product_subtitle
  const size = item.variant_title
  const slug = item.product_handle
  const imageConfig = imageSizeConfig[imageSize]

  const maxQuantity = item.variant?.manage_inventory
    ? Math.max(item.variant.inventory_quantity ?? 1, 1)
    : undefined

  const handleRemove = async () => {
    setIsRemoving(true)
    const { error } = await removeItemFromCart(item.id)

    if (error) {
      toast.error(error)
    } else {
      startTransition(() => {
        router.refresh()
        onRemoveSuccess?.()
      })
    }

    setIsRemoving(false)
  }

  const handleQuantityChange = async (nextQuantity: number) => {
    if (nextQuantity === quantity) return

    const previousQuantity = quantity
    setQuantity(nextQuantity)
    setIsUpdating(true)

    const { error } = await updateItemQuantity(item.id, nextQuantity)

    if (error) {
      toast.error(error)
      setQuantity(previousQuantity)
    } else {
      startTransition(() => {
        router.refresh()
      })
    }

    setIsUpdating(false)
  }

  return (
    <div className="py-5">
      <div className="sm:flex sm:items-center sm:gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {thumbnail && (
            <div
              className={`relative shrink-0 ${imageConfig.containerClass} overflow-visible`}
            >
              {slug ? (
                <Link
                  href={productPath(slug)}
                  className="relative block w-full h-full"
                  onClick={() => onNavigate?.()}
                >
                  <ProductCardImage
                    src={thumbnail}
                    alt={title || 'Product'}
                    sizes={imageConfig.sizes}
                  />
                </Link>
              ) : (
                <ProductCardImage
                  src={thumbnail}
                  alt={title || 'Product'}
                  sizes={imageConfig.sizes}
                />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            {slug ? (
              <Link
                href={productPath(slug)}
                className="text-base font-medium hover:underline line-clamp-1"
                onClick={() => onNavigate?.()}
              >
                {title}
              </Link>
            ) : (
              <p className="text-base font-medium line-clamp-1">{title}</p>
            )}

            {subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {subtitle}
              </p>
            )}

            <p className="text-sm text-muted-foreground mt-1">
              {size && size !== 'Default Variant' ? `Size: ${size} · ` : ''}
              Qty: {quantity}
            </p>

            <div className="text-base font-medium mt-2">
              {formatPrice(item.unit_price, currencyCode)}
            </div>

            {!readOnly && (
              <div className="mt-3 flex items-center gap-3 sm:hidden">
                <Stepper
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={maxQuantity}
                  disabled={isRemoving || isUpdating || isPending}
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRemove}
                  disabled={isRemoving || isUpdating || isPending}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {!readOnly && (
          <div className="hidden items-center justify-end gap-3 sm:mt-0 sm:flex sm:shrink-0">
            <Stepper
              value={quantity}
              onChange={handleQuantityChange}
              min={1}
              max={maxQuantity}
              disabled={isRemoving || isUpdating || isPending}
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
              disabled={isRemoving || isUpdating || isPending}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
