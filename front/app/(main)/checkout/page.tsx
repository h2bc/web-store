import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Heading from '@/components/layout/heading'
import CheckoutStepSection from '@/components/checkout/checkout-step-section'
import CheckoutSummary from '@/components/checkout/checkout-summary'
import AddressStep from '@/components/checkout/address-step'
import DeliveryStep from '@/components/checkout/delivery-step'
import PaymentStep from '@/components/checkout/payment-step'
import PaymentSessionStarter from '@/components/checkout/payment-session-starter'
import CheckoutElements from '@/components/checkout/checkout-elements'
import ErrorAlert from '@/components/feedback/error-alert'
import { getCart } from '@/lib/data/cart'
import { listCartShippingOptions } from '@/lib/data/shipping'
import { getClientSecret } from '@/lib/payment-provider'
import { CHECKOUT_STEPS, type CheckoutStep } from '@/lib/checkout-steps'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  const params = await searchParams
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY ?? null

  if (!stripePublishableKey) {
    console.error('STRIPE_PUBLISHABLE_KEY is not set; checkout is disabled.')
  }

  const { cart, error } = await getCart()

  if (error && error !== 'No cart found') {
    return (
      <div className="flex justify-center pt-15">
        <ErrorAlert message={error} />
      </div>
    )
  }

  if (!cart || (cart.items?.length ?? 0) === 0) {
    redirect('/cart')
  }

  const addressDone = Boolean(cart.email && cart.shipping_address?.address_1)
  const deliveryDone = addressDone && (cart.shipping_methods?.length ?? 0) > 0

  const furthest: CheckoutStep = !addressDone
    ? 'address'
    : !deliveryDone
      ? 'delivery'
      : 'payment'

  const requested = params.step as CheckoutStep | undefined

  const requestedIndex = requested ? CHECKOUT_STEPS.indexOf(requested) : -1
  const furthestIndex = CHECKOUT_STEPS.indexOf(furthest)
  const step: CheckoutStep =
    requestedIndex >= 0 && requestedIndex <= furthestIndex
      ? requested!
      : furthest

  const countryCodes = (cart.region?.countries ?? []).flatMap((c) =>
    c.iso_2 ? [c.iso_2.toUpperCase()] : []
  )

  const { options, error: shippingError } =
    step === 'delivery'
      ? await listCartShippingOptions()
      : { options: [], error: null }

  const shippingMethod = cart.shipping_methods?.[0]

  const clientSecret = step === 'payment' ? getClientSecret(cart) : null

  const address = cart.shipping_address

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-5xl w-full flex flex-col pb-12">
        <Heading level={1} font="blackletter" className="mb-8">
          Checkout
        </Heading>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8 items-start">
          {stripePublishableKey ? (
            <CheckoutElements
              publishableKey={stripePublishableKey}
              clientSecret={clientSecret}
            >
              <div className="space-y-4">
                <CheckoutStepSection
                  step={1}
                  title="Address"
                  isActive={step === 'address'}
                  isComplete={addressDone}
                  editHref="/checkout?step=address"
                  summary={
                    <div className="text-sm text-muted-foreground">
                      <p>{cart.email}</p>
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
                  }
                >
                  <AddressStep cart={cart} countryCodes={countryCodes} />
                </CheckoutStepSection>

                <CheckoutStepSection
                  step={2}
                  title="Delivery"
                  isActive={step === 'delivery'}
                  isComplete={deliveryDone}
                  editHref="/checkout?step=delivery"
                  summary={
                    <p className="text-sm text-muted-foreground">
                      {shippingMethod?.name}
                    </p>
                  }
                >
                  {shippingError ? (
                    <ErrorAlert message={shippingError} />
                  ) : (
                    <DeliveryStep
                      options={options}
                      currencyCode={cart.currency_code}
                      selectedOptionId={shippingMethod?.shipping_option_id}
                    />
                  )}
                </CheckoutStepSection>

                <CheckoutStepSection
                  step={3}
                  title="Payment"
                  isActive={step === 'payment'}
                  isComplete={false}
                >
                  {clientSecret ? (
                    <PaymentStep cart={cart} />
                  ) : (
                    <PaymentSessionStarter />
                  )}
                </CheckoutStepSection>
              </div>
            </CheckoutElements>
          ) : (
            <ErrorAlert message="Payments are temporarily unavailable. Please try again later." />
          )}

          <aside className="lg:sticky lg:top-24">
            <CheckoutSummary cart={cart} />
          </aside>
        </div>
      </div>
    </div>
  )
}
