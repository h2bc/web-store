'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconBadge } from '@/components/ui/icon-badge'
import { formatPrice } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import CartPreviewItem from './cart-preview-item'
import CartEmptyState from '@/components/cart/cart-empty-state'
import ShippingInfoAlert from '@/components/cart/shipping-info-alert'
import type { HttpTypes } from '@medusajs/types'

interface CartPreviewProps {
  cart: HttpTypes.StoreCart | null
}

export default function CartPreview({ cart }: CartPreviewProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const items = cart?.items ?? []

  const itemCount =
    items.reduce((total, item) => total + item.quantity, 0) ?? 0

  const handleCartClick = () => {
    // If on cart or checkout page, redirect to cart
    if (pathname === '/cart' || pathname === '/checkout') {
      router.push('/cart')
    } else {
      // Otherwise, open the drawer
      setOpen(true)
    }
  }

  const handleRemoveSuccess = () => {
    // If cart becomes empty, close the drawer
    if (items.length === 1) {
      setOpen(false)
    }
  }

  const handleNavigateFromDrawer = () => {
    setOpen(false)
  }

  return (
    <>
      <Button variant="ghost" onClick={handleCartClick} aria-label="Cart">
        {itemCount ? (
          <IconBadge badge={`${itemCount}`} badgeClassName="bg-pink-500">
            <ShoppingBag />
          </IconBadge>
        ) : (
          <ShoppingBag />
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription>
              {itemCount === 0
                ? 'Your cart is empty'
                : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart`}
            </SheetDescription>
          </SheetHeader>

          {items.length > 0 ? (
            <>
              {/* Cart Items - scrollable area */}
              <div className="flex-1 overflow-y-auto divide-y px-3 sm:px-4">
                {items.map((item) => (
                  <CartPreviewItem
                    key={item.id}
                    item={item}
                    currencyCode={cart?.currency_code}
                    onRemoveSuccess={handleRemoveSuccess}
                    onNavigate={handleNavigateFromDrawer}
                  />
                ))}
              </div>

              {/* Free Shipping Alert */}
              <ShippingInfoAlert
                className="mt-4"
                descriptionClassName="text-center"
                onLearnMoreClick={handleNavigateFromDrawer}
              />

              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-muted-foreground">Subtotal (VAT included)</span>
                <span className="font-medium">
                  {formatPrice(cart?.item_total, cart?.currency_code)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Button asChild size="lg">
                  <Link href="/checkout" onClick={handleNavigateFromDrawer}>
                    Checkout
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/cart" onClick={handleNavigateFromDrawer}>
                    Go to cart
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <CartEmptyState onNavigate={handleNavigateFromDrawer} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
