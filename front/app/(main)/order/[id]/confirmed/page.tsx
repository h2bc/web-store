import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import Heading from '@/components/layout/heading'
import ErrorAlert from '@/components/feedback/error-alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getOrder } from '@/lib/data/orders'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
}

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { order, error } = await getOrder(id)

  if (error || !order) {
    return (
      <div className="flex justify-center pt-15">
        <ErrorAlert message={error ?? 'Order not found.'} />
      </div>
    )
  }

  const currency = order.currency_code

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-2xl w-full flex flex-col pb-12">
        <div className="flex flex-col items-center text-center mb-8">
          <CheckCircle2 className="h-12 w-12 mb-4" />
          <Heading level={1} font="blackletter" className="mb-2">
            Thank you
          </Heading>
          <p className="text-muted-foreground">
            Your order is confirmed. A receipt is on its way to {order.email}.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order</span>
              <span className="font-medium">#{order.display_id}</span>
            </div>

            <Separator />

            <div className="divide-y">
              {(order.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span>
                    {item.product_title}
                    {item.variant_title &&
                    item.variant_title !== 'Default Variant'
                      ? ` · ${item.variant_title}`
                      : ''}{' '}
                    × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.unit_price, currency)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{formatPrice(order.shipping_total, currency)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                {formatPrice(order.total, currency)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Button asChild variant="outline" size="lg" className="mt-8">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}
