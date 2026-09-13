import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import PaymentReturn from '@/components/checkout/payment-return'
import { getCart } from '@/lib/data/cart'
import { cartOwnsClientSecret } from '@/lib/payment-provider'

export const metadata: Metadata = {
  title: 'Checkout',
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
      <div className="max-w-4xl w-full flex flex-col pb-12">
        <PaymentReturn
          publishableKey={publishableKey}
          clientSecret={clientSecret}
        />
      </div>
    </div>
  )
}
