import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  ShippingInfoAlert,
} from 'h2bc-web-front'

const items = [
  { title: 'Oversized hoodie', variant: 'Black / M', price: '€54,00 EUR' },
  { title: 'Logo tee', variant: 'White / S', price: '€25,00 EUR' },
]

const CartLines = () => (
  <div className="flex-1 overflow-y-auto divide-y px-3 sm:px-4">
    {items.map((item) => (
      <div key={item.title} className="flex items-center justify-between py-3 text-sm">
        <div className="flex flex-col">
          <span className="font-medium">{item.title}</span>
          <span className="text-muted-foreground">{item.variant}</span>
        </div>
        <span className="font-medium">{item.price}</span>
      </div>
    ))}
  </div>
)

export const Open = () => (
  <Sheet open modal={false}>
    <SheetContent className="flex flex-col w-full sm:max-w-sm">
      <SheetHeader>
        <SheetTitle>Shopping Cart</SheetTitle>
        <SheetDescription>2 items in your cart</SheetDescription>
      </SheetHeader>
      <CartLines />
      <ShippingInfoAlert className="mt-4" descriptionClassName="text-center" />
      <div className="flex items-center justify-between py-2 text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">€79,00 EUR</span>
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Button size="lg">Checkout</Button>
        <Button variant="outline" size="lg">
          Go to cart
        </Button>
      </div>
    </SheetContent>
  </Sheet>
)

export const SideBottom = () => (
  <Sheet open modal={false}>
    <SheetContent side="bottom">
      <SheetHeader>
        <SheetTitle>Shipping to Lithuania</SheetTitle>
        <SheetDescription>
          Free shipping above €30. Orders ship within 1–2 business days.
        </SheetDescription>
      </SheetHeader>
      <SheetFooter className="mt-4">
        <Button variant="outline">Change region</Button>
        <Button>Got it</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

export const SideLeft = () => (
  <Sheet open modal={false}>
    <SheetContent side="left">
      <SheetHeader>
        <SheetTitle>Menu</SheetTitle>
        <SheetDescription>Browse the collection</SheetDescription>
      </SheetHeader>
      <ul className="mt-4 flex flex-col divide-y divide-black/10 text-2xl">
        {['Shop', 'Gallery', 'About', 'Contact'].map((label) => (
          <li key={label} className="py-3">
            {label}
          </li>
        ))}
      </ul>
    </SheetContent>
  </Sheet>
)
