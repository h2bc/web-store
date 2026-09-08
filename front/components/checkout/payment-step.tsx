'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { toast } from 'sonner'
import type { HttpTypes } from '@medusajs/types'
import { Button } from '@/components/ui/button'
import ErrorAlert from '@/components/feedback/error-alert'
import { stripePromise } from '@/lib/stripe'
import { completeCart } from '@/lib/data/cart'
import { getClientSecret } from '@/lib/payment-provider'

interface PaymentStepProps {
  cart: HttpTypes.StoreCart
  clientSecret: string | null
  error: string | null
}

function PaymentForm({ cart }: { cart: HttpTypes.StoreCart }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isPlacing, setIsPlacing] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const address = cart.shipping_address

  const handlePlaceOrder = async () => {
    if (!stripe || !elements || isPlacing) return

    const card = elements.getElement(CardElement)
    if (!card) return

    setIsPlacing(true)
    setCardError(null)

    const clientSecret = getClientSecret(cart)

    if (!clientSecret) {
      setCardError('Payment session expired. Please refresh and try again.')
      setIsPlacing(false)
      return
    }

    const { error: stripeError } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card,
          billing_details: {
            name: `${address?.first_name ?? ''} ${address?.last_name ?? ''}`.trim(),
            email: cart.email ?? undefined,
            address: {
              line1: address?.address_1 ?? undefined,
              line2: address?.address_2 ?? undefined,
              city: address?.city ?? undefined,
              postal_code: address?.postal_code ?? undefined,
              country: address?.country_code?.toUpperCase(),
            },
          },
        },
      }
    )

    if (stripeError) {
      setCardError(stripeError.message ?? 'Your card could not be charged.')
      setIsPlacing(false)
      return
    }

    const { orderId, error } = await completeCart()

    if (error || !orderId) {
      setCardError(error ?? 'Could not place the order.')
      setIsPlacing(false)
      return
    }

    router.push(`/order/${orderId}/confirmed`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <CardElement
          options={{
            hidePostalCode: true,
            style: { base: { fontSize: '16px' } },
          }}
          onChange={(event) => setCardError(event.error?.message ?? null)}
        />
      </div>

      {cardError && <ErrorAlert message={cardError} />}

      <Button
        size="lg"
        className="w-full"
        onClick={handlePlaceOrder}
        disabled={!stripe || isPlacing}
      >
        {isPlacing ? 'Placing order…' : 'Place order'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your card is charged only when the order is placed.
      </p>
    </div>
  )
}

export default function PaymentStep({
  cart,
  clientSecret,
  error,
}: PaymentStepProps) {
  if (error || !clientSecret) {
    return <ErrorAlert message={error ?? 'Could not start the payment.'} />
  }

  if (!stripePromise) {
    return (
      <ErrorAlert message="Payments are unavailable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set." />
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm cart={cart} />
    </Elements>
  )
}
