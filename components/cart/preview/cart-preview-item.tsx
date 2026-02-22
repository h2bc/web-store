'use client'

import type { HttpTypes } from '@medusajs/types'
import CartLineItem from '@/components/cart/cart-line-item'

interface CartPreviewItemProps {
  item: HttpTypes.StoreCartLineItem
  currencyCode?: string
  onRemoveSuccess?: () => void
  onNavigate?: () => void
}

export default function CartPreviewItem({
  item,
  currencyCode,
  onRemoveSuccess,
  onNavigate,
}: CartPreviewItemProps) {
  return (
    <CartLineItem
      item={item}
      currencyCode={currencyCode}
      onRemoveSuccess={onRemoveSuccess}
      onNavigate={onNavigate}
      imageSize="sm"
    />
  )
}
