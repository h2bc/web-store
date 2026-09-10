import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Heading from '@/components/layout/heading'
import CheckoutStepSection from '@/components/checkout/checkout-step-section'
import CheckoutSummary from '@/components/checkout/checkout-summary'
import AddressStep from '@/components/checkout/address-step'
import DeliveryStep from '@/components/checkout/delivery-step'
import PaymentStep from '@/components/checkout/payment-step'
import ErrorAlert from '@/components/feedback/error-alert'
import { getCart } from '@/lib/data/cart'
import { listCartShippingOptions } from '@/lib/data/shipping'
import { initiateStripeSession } from '@/lib/data/payment'
import { CHECKOUT_STEPS, type CheckoutStep } from '@/lib/schemas/checkout'

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

  const params = await searchParams
  const requested = params.step as CheckoutStep | undefined

  const requestedIndex = requested ? CHECKOUT_STEPS.indexOf(requested) : -1
  const furthestIndex = CHECKOUT_STEPS.indexOf(furthest)
  const step: CheckoutStep =
    requestedIndex >= 0 && requestedIndex <= furthestIndex
      ? requested!
      : furthest

  const countries = (cart.region?.countries ?? [])
    .map((c) => ({
      code: c.iso_2 ?? '',
      name: c.display_name ?? c.name ?? '',
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const needsShippingOptions = step === 'delivery' || deliveryDone
  const { options, error: shippingError } = needsShippingOptions
    ? await listCartShippingOptions()
    : { options: [], error: null }

  const selectedOptionId = cart.shipping_methods?.[0]?.shipping_option_id
  const selectedOptionName =
    options.find((o) => o.id === selectedOptionId)?.name ?? 'Selected'

  const { clientSecret, error: paymentError } =
    step === 'payment'
      ? await initiateStripeSession()
      : { clientSecret: null, error: null }

  const { cart: cartWithSession } =
    step === 'payment' ? await getCart() : { cart: null }

  const address = cart.shipping_address

  return (
    <div className="flex justify-center pt-15">
      <div className="max-w-5xl w-full flex flex-col pb-12">
        <Heading level={1} font="blackletter" className="mb-8">
          Checkout
        </Heading>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8 items-start">
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
              <AddressStep cart={cart} countries={countries} />
            </CheckoutStepSection>

            <CheckoutStepSection
              step={2}
              title="Delivery"
              isActive={step === 'delivery'}
              isComplete={deliveryDone}
              editHref="/checkout?step=delivery"
              summary={
                <p className="text-sm text-muted-foreground">
                  {selectedOptionName}
                </p>
              }
            >
              {shippingError ? (
                <ErrorAlert message={shippingError} />
              ) : (
                <DeliveryStep
                  options={options}
                  currencyCode={cart.currency_code}
                  selectedOptionId={selectedOptionId}
                />
              )}
            </CheckoutStepSection>

            <CheckoutStepSection
              step={3}
              title="Payment"
              isActive={step === 'payment'}
              isComplete={false}
            >
              <PaymentStep
                cart={cartWithSession ?? cart}
                clientSecret={clientSecret}
                error={paymentError}
                stripePublishableKey={process.env.STRIPE_PUBLISHABLE_KEY ?? null}
              />
            </CheckoutStepSection>
          </div>

          <aside className="lg:sticky lg:top-24">
            <CheckoutSummary cart={cart} />
          </aside>
        </div>
      </div>
    </div>
  )
}
