import type { Metadata } from 'next'
import Link from 'next/link'
import Heading from '@/components/layout/heading'
import ErrorAlert from '@/components/feedback/error-alert'
import CheckoutSummary from '@/components/checkout/checkout-summary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const address = order.shipping_address
  const shippingMethod = order.shipping_methods?.[0]
  const placedOn = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-5xl w-full flex flex-col pb-12">
        <Heading level={1} font="blackletter" className="mb-8">
          Order confirmed
        </Heading>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8 items-start">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Thank you
                  {address?.first_name ? `, ${address.first_name}` : ''}!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Order #{order.display_id} was placed on {placedOn}.
                </p>
                <p>A confirmation email is on its way to {order.email}.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-medium mb-1">Contact</p>
                  <div className="text-muted-foreground">
                    <p>{order.email}</p>
                    {address?.phone && <p>{address.phone}</p>}
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-1">Shipping address</p>
                  <div className="text-muted-foreground">
                    <p>
                      {address?.first_name} {address?.last_name}
                    </p>
                    <p>
                      {address?.address_1}
                      {address?.address_2 ? `, ${address.address_2}` : ''}
                    </p>
                    <p>
                      {address?.postal_code} {address?.city},{' '}
                      {address?.country_code?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-1">Delivery</p>
                  <div className="text-muted-foreground">
                    <p>{shippingMethod?.name ?? '—'}</p>
                    <p>
                      {formatPrice(order.shipping_total, order.currency_code)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-1">Payment</p>
                  <div className="text-muted-foreground">
                    <p>Card</p>
                    <p>{formatPrice(order.total, order.currency_code)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <CheckoutSummary cart={order} />
            <Button asChild size="lg" className="w-full">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  )
}
