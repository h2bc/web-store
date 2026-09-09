import { Button } from 'h2bc-web-front'
import { ShoppingBag, ChevronDown } from 'lucide-react'

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Checkout</Button>
    <Button variant="secondary">Save address</Button>
    <Button variant="outline">Continue shopping</Button>
    <Button variant="ghost">Cancel</Button>
    <Button variant="link">Learn more</Button>
    <Button variant="destructive">Remove item</Button>
  </div>
)

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon" aria-label="Cart">
      <ShoppingBag />
    </Button>
  </div>
)

export const StorefrontActions = () => (
  <div className="flex max-w-xs flex-col gap-3">
    <Button size="lg">Checkout</Button>
    <Button variant="outline" size="lg">
      Continue shopping
    </Button>
    <Button variant="link" className="uppercase p-0 self-start">
      Shipping &amp; returns
    </Button>
  </div>
)

export const WithIconAndStates = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button variant="ghost" className="gap-1">
      EU <ChevronDown size={16} />
    </Button>
    <Button disabled>Processing…</Button>
    <Button variant="outline" disabled>
      Sold out
    </Button>
  </div>
)
