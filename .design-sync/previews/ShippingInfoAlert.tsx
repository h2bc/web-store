import { ShippingInfoAlert } from 'h2bc-web-front'

export const Default = () => (
  <div className="w-full max-w-xs">
    <ShippingInfoAlert />
  </div>
)

export const Centered = () => (
  <div className="w-full max-w-xs">
    <ShippingInfoAlert descriptionClassName="text-center" />
  </div>
)

export const InCartPage = () => (
  <div className="w-full max-w-sm space-y-4">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Subtotal</span>
      <span className="font-medium">€25,00 EUR</span>
    </div>
    <ShippingInfoAlert className="mt-4" />
  </div>
)
