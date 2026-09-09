import { CheckoutStepSection, Input, Label, Button } from 'h2bc-web-front'

const AddressSummary = () => (
  <div className="text-sm text-muted-foreground">
    <p>ruta@example.lt</p>
    <p>Rūta Kazlauskienė</p>
    <p>Gedimino pr. 9-12</p>
    <p>01103 Vilnius, LT</p>
  </div>
)

const AddressFields = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="first-name">First name</Label>
        <Input id="first-name" defaultValue="Rūta" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last name</Label>
        <Input id="last-name" defaultValue="Kazlauskienė" />
      </div>
    </div>
    <Button>Continue to delivery</Button>
  </div>
)

export const ActiveStep = () => (
  <div className="w-full max-w-sm">
    <CheckoutStepSection step={1} title="Address" isActive isComplete={false}>
      <AddressFields />
    </CheckoutStepSection>
  </div>
)

export const CompletedStep = () => (
  <div className="w-full max-w-sm">
    <CheckoutStepSection
      step={1}
      title="Address"
      isActive={false}
      isComplete
      editHref="/checkout?step=address"
      summary={<AddressSummary />}
    />
  </div>
)

export const UpcomingStep = () => (
  <div className="w-full max-w-sm">
    <CheckoutStepSection step={3} title="Payment" isActive={false} isComplete={false} />
  </div>
)

export const CheckoutFlow = () => (
  <div className="w-full max-w-sm space-y-4">
    <CheckoutStepSection
      step={1}
      title="Address"
      isActive={false}
      isComplete
      editHref="/checkout?step=address"
      summary={<AddressSummary />}
    />
    <CheckoutStepSection step={2} title="Delivery" isActive isComplete={false}>
      <p className="text-sm text-muted-foreground">
        Omniva parcel locker — €2,99 EUR
      </p>
    </CheckoutStepSection>
    <CheckoutStepSection step={3} title="Payment" isActive={false} isComplete={false} />
  </div>
)
