'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
      <div className="space-y-6">
        <ErrorAlert message={state.message} />
        <Button asChild>
          <Link href="/checkout?step=payment">Back to payment</Link>
        </Button>
      </div>
    )
  }

  if (state.kind === 'processing') {
    return (
      <div className="space-y-2 max-w-2xl">
        <p className="text-sm">
          Your payment is being processed. This can take a few days for bank
          payments.
        </p>
        <p className="text-sm text-muted-foreground">
          We will email your order confirmation as soon as the payment clears.
        </p>
      </div>
    )
  }

  return <p className="text-sm text-muted-foreground">Confirming payment…</p>
}
