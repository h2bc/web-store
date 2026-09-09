import { Separator } from 'h2bc-web-front'

export const Horizontal = () => (
  <div className="max-w-sm space-y-4">
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Subtotal</span>
      <span className="font-medium">€54,00 EUR</span>
    </div>
    <Separator />
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">Delivery</span>
      <span className="font-medium">€2,99 EUR</span>
    </div>
    <Separator />
    <div className="flex items-center justify-between">
      <span className="font-medium">Total</span>
      <span className="font-medium">€56,99 EUR</span>
    </div>
  </div>
)

export const Vertical = () => (
  <div className="flex h-5 items-center gap-4 text-sm">
    <span>Shop</span>
    <Separator orientation="vertical" />
    <span>Gallery</span>
    <Separator orientation="vertical" />
    <span>About</span>
    <Separator orientation="vertical" />
    <span>Contact</span>
  </div>
)
