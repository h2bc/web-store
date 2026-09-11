'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { HttpTypes } from '@medusajs/types'
import { Button } from '@/components/ui/button'
import ErrorAlert from '@/components/feedback/error-alert'
import { completeCart } from '@/lib/data/cart'
import { getClientSecret } from '@/lib/payment-provider'

interface PaymentStepProps {
  cart: HttpTypes.StoreCart
}

export default function PaymentStep({ cart }: PaymentStepProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isPlacing, setIsPlacing] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const address = cart.shipping_address

  const handlePlaceOrder = async () => {
    if (!stripe || !elements || isPlacing) return

    setIsPlacing(true)
    setPaymentError(null)

    let stripeError: { message?: string } | undefined

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout/return`,
          payment_method_data: {
            billing_details: {
              name: `${address?.first_name ?? ''} ${address?.last_name ?? ''}`.trim(),
              email: cart.email ?? '',
              address: {
                line1: address?.address_1 ?? '',
                line2: address?.address_2 ?? '',
                city: address?.city ?? '',
                state: address?.province ?? '',
                postal_code: address?.postal_code ?? '',
                country: address?.country_code?.toUpperCase() ?? '',
              },
            },
          },
        },
      })

      stripeError = result.error
    } catch (error) {
      stripeError = {
        message: error instanceof Error ? error.message : undefined,
      }
    }

    if (stripeError) {
      setPaymentError(
        stripeError.message ?? 'Your payment could not be completed.'
      )
      setIsPlacing(false)

      return
    }

    const orderId = await completeCart()

    if (!orderId) {
      const clientSecret = getClientSecret(cart)

      router.replace(
        clientSecret
          ? `/checkout/return?payment_intent_client_secret=${encodeURIComponent(clientSecret)}`
          : '/checkout/return'
      )

      return
    }

    router.push(`/order/${orderId}/confirmed`)
  }

  return (
    <div className="space-y-6">
      <PaymentElement
        options={{
          fields: {
            billingDetails: { name: 'never', email: 'never', address: 'never' },
          },
          wallets: { link: 'never' },
        }}
        onReady={() => setIsReady(true)}
      />

      {paymentError && <ErrorAlert message={paymentError} />}

      <Button
        size="lg"
        className="w-full"
        onClick={handlePlaceOrder}
        disabled={!stripe || !isReady || isPlacing}
      >
        {isPlacing ? 'Placing order…' : 'Place order'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your card is charged only when the order is placed.
      </p>
    </div>
  )
}
