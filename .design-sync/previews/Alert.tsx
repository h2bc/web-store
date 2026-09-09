import { Alert, AlertDescription, AlertTitle } from 'h2bc-web-front'
import { AlertCircle, Info, Truck } from 'lucide-react'

export const ShippingInfo = () => (
  <Alert className="max-w-md">
    <Info className="h-4 w-4" />
    <AlertDescription>
      Free shipping above €30 (LT) / €60 (Europe).{' '}
      <a href="#" className="underline hover:text-foreground">
        Learn more
      </a>
    </AlertDescription>
  </Alert>
)

export const Destructive = () => (
  <Alert variant="destructive" className="max-w-md">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Payment failed</AlertTitle>
    <AlertDescription>
      Your card was declined. Please try another payment method.
    </AlertDescription>
  </Alert>
)

export const WithTitle = () => (
  <Alert className="max-w-md">
    <Truck className="h-4 w-4" />
    <AlertTitle>Order shipped</AlertTitle>
    <AlertDescription>
      Your parcel is on its way to the Omniva locker at Gedimino pr. 9, Vilnius.
    </AlertDescription>
  </Alert>
)
