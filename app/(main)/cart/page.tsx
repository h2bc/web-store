import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import Heading from '@/components/layout/heading'
import CartLineItem from '@/components/cart/cart-line-item'
import CartEmptyState from '@/components/cart/cart-empty-state'
import ShippingInfoAlert from '@/components/cart/shipping-info-alert'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getCart } from '@/lib/data/cart'
import { formatPrice } from '@/lib/utils'

export const metadata = {
  title: 'Cart',
  description: 'Review your cart items',
}

export default async function CartPage() {
  const { cart, error } = await getCart()

  if (error && error !== 'No cart found') {
    return (
      <div className="flex justify-center pt-15">
        <div className="max-w-4xl w-full flex flex-col">
          <Alert variant="destructive" className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const items = cart?.items ?? []
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-4xl w-full flex flex-col pb-12">
        <Heading level={1} font="blackletter" className="mb-8">
          Cart
        </Heading>
        {items.length === 0 ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <CartEmptyState />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-8 items-start">
            <section className="rounded-xl border divide-y">
              {items.map((item) => (
                <div key={item.id} className="px-4 sm:px-6">
                  <CartLineItem item={item} currencyCode={cart?.currency_code} />
                </div>
              ))}
            </section>

            <aside className="lg:sticky lg:top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Order summary</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal (VAT included)
                    </span>
                    <span className="font-medium">
                      {formatPrice(cart?.item_total, cart?.currency_code)}
                    </span>
                  </div>

                  <ShippingInfoAlert />

                  <div className="flex flex-col gap-3 pt-2">
                    <Button asChild size="lg">
                      <Link href="/checkout">Checkout</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/shop">Continue shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
