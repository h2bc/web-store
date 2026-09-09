import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
  ShippingInfoAlert,
} from 'h2bc-web-front'

export const OrderSummary = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle>Order summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Items</span>
        <span className="font-medium">2 items</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">€54,00 EUR</span>
      </div>
      <ShippingInfoAlert />
      <div className="flex flex-col gap-3 pt-2">
        <Button size="lg">Checkout</Button>
        <Button variant="outline" size="lg">
          Continue shopping
        </Button>
      </div>
    </CardContent>
  </Card>
)

export const Anatomy = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle>Order #1042 confirmed</CardTitle>
      <CardDescription>A confirmation email is on its way to you.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Delivery</span>
        <span className="font-medium">Omniva parcel locker</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="font-medium">Total</span>
        <span className="font-medium">€61,90 EUR</span>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" className="w-full">
        Back to shop
      </Button>
    </CardFooter>
  </Card>
)
