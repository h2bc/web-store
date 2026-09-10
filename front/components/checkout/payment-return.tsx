'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ErrorAlert from '@/components/feedback/error-alert'
import { completeCart, releaseCart } from '@/lib/data/cart'
import { getStripe } from '@/lib/stripe'

interface PaymentReturnProps {
  publishableKey: string
  clientSecret: string
}

type State =
  | { kind: 'verifying' }
  | { kind: 'processing' }
  | { kind: 'failed'; message: string }

export default function PaymentReturn({
  publishableKey,
  clientSecret,
}: PaymentReturnProps) {
  const router = useRouter()
  const started = useRef(false)
  const [state, setState] = useState<State>({ kind: 'verifying' })

  useEffect(() => {
    if (started.current) return
    started.current = true

    const fail = (message: string) => setState({ kind: 'failed', message })

    const run = async () => {
      const stripe = await getStripe(publishableKey)
      if (!stripe) {
        fail('Could not load the payment provider.')
        return
      }

      const { paymentIntent, error } =
        await stripe.retrievePaymentIntent(clientSecret)
      if (error || !paymentIntent) {
        fail(error?.message ?? 'Could not verify the payment.')
        return
      }

      switch (paymentIntent.status) {
        case 'succeeded':
        case 'requires_capture': {
          const { orderId, error: cartError } = await completeCart()
          if (cartError || !orderId) {
            fail(cartError ?? 'Could not place the order.')
            return
          }
          router.replace(`/order/${orderId}/confirmed`)
          return
        }
        case 'processing':
          await releaseCart()
          setState({ kind: 'processing' })
          return
        default:
          fail(
            paymentIntent.last_payment_error?.message ??
              'Your payment was not completed.'
          )
      }
    }

    run()
  }, [publishableKey, clientSecret, router])

  if (state.kind === 'failed') {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ErrorAlert message={state.message} className="max-w-none" />
            <p>
              You have not been charged. You can try again or use a different
              payment method.
            </p>
          </CardContent>
        </Card>
        <aside className="lg:sticky lg:top-24">
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout?step=payment">Back to payment</Link>
          </Button>
        </aside>
      </>
    )
  }

  if (state.kind === 'processing') {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment pending</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>
              Your payment is being processed. This can take a few days for bank
              payments.
            </p>
            <p>
              We will email your order confirmation as soon as the payment
              clears.
            </p>
          </CardContent>
        </Card>
        <aside className="lg:sticky lg:top-24">
          <Button asChild size="lg" className="w-full">
            <Link href="/shop">Continue shopping</Link>
          </Button>
        </aside>
      </>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirming payment
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>
          Please wait while we confirm your payment. Do not close this page.
        </p>
      </CardContent>
    </Card>
  )
}
