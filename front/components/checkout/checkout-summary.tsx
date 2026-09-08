import type { HttpTypes } from '@medusajs/types'
import CartLineItem from '@/components/cart/cart-line-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'

interface CheckoutSummaryProps {
  cart: HttpTypes.StoreCart
}

export default function CheckoutSummary({ cart }: CheckoutSummaryProps) {
  const items = cart.items ?? []
  const currency = cart.currency_code
  const hasShipping = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="divide-y">
          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              currencyCode={currency}
              imageSize="sm"
              readOnly
            />
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {formatPrice(cart.item_total, currency)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Delivery</span>
          <span className="font-medium">
            {hasShipping ? formatPrice(cart.shipping_total, currency) : '—'}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-medium">Total</span>
          <span className="font-medium">
            {formatPrice(cart.total, currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
