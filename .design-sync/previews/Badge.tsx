import { Badge } from 'h2bc-web-front'

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Badge>New</Badge>
    <Badge variant="secondary">Limited</Badge>
    <Badge variant="outline">Unisex</Badge>
    <Badge variant="destructive">Sold out</Badge>
  </div>
)

export const OnProduct = () => (
  <div className="flex max-w-xs flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="font-medium">Blackletter Hoodie</span>
      <Badge>New</Badge>
    </div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">€54,00 EUR</span>
      <Badge variant="outline">M</Badge>
    </div>
  </div>
)

export const OrderStatus = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Badge variant="secondary">Pending</Badge>
    <Badge>Paid</Badge>
    <Badge variant="outline">Shipped</Badge>
    <Badge variant="destructive">Cancelled</Badge>
  </div>
)
