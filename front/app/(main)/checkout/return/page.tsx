import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Heading from '@/components/layout/heading'
import PaymentReturn from '@/components/checkout/payment-return'
import { getCart } from '@/lib/data/cart'
import { cartOwnsClientSecret } from '@/lib/payment-provider'

export const metadata: Metadata = {
  title: 'Confirming payment',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent_client_secret?: string }>
}) {
  const { payment_intent_client_secret: clientSecret } = await searchParams
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY

  if (!clientSecret || !publishableKey) {
    redirect('/checkout')
  }

  const { cart } = await getCart()
  if (!cart || !cartOwnsClientSecret(cart, clientSecret)) {
    redirect('/checkout')
  }

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-5xl w-full flex flex-col pb-12">
        <Heading level={1} font="blackletter" className="mb-8">
          Checkout
        </Heading>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8 items-start">
          <PaymentReturn
            publishableKey={publishableKey}
            clientSecret={clientSecret}
          />
        </div>
      </div>
    </div>
  )
}
