import { ErrorAlert } from 'h2bc-web-front'

export const Default = () => (
  <ErrorAlert message="Could not load shipping options. Please try again." />
)

export const CustomTitle = () => (
  <ErrorAlert
    title="Payment failed"
    message="Your card was declined. Try another card or contact your bank."
  />
)

export const InCheckoutColumn = () => (
  <div className="w-full max-w-xs">
    <ErrorAlert
      title="Cart unavailable"
      message="We could not find your cart. Refresh the page or start a new one."
      className="max-w-none"
    />
  </div>
)
