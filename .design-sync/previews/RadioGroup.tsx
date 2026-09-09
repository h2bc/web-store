import { Label, RadioGroup, RadioGroupItem } from 'h2bc-web-front'

export const DeliveryOptions = () => (
  <RadioGroup defaultValue="omniva" className="max-w-md space-y-2">
    <Label
      htmlFor="omniva"
      className="flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer font-normal has-[:checked]:border-foreground"
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="omniva" id="omniva" />
        <span>Omniva parcel locker</span>
      </div>
      <span className="font-medium">€2,99 EUR</span>
    </Label>
    <Label
      htmlFor="dpd"
      className="flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer font-normal has-[:checked]:border-foreground"
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="dpd" id="dpd" />
        <span>DPD courier</span>
      </div>
      <span className="font-medium">€4,99 EUR</span>
    </Label>
    <Label
      htmlFor="pickup"
      className="flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer font-normal has-[:checked]:border-foreground"
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="pickup" id="pickup" />
        <span>Pick-up in Vilnius</span>
      </div>
      <span className="font-medium">Free</span>
    </Label>
  </RadioGroup>
)

export const Compact = () => (
  <RadioGroup defaultValue="m">
    <div className="flex items-center gap-2">
      <RadioGroupItem value="s" id="size-s" />
      <Label htmlFor="size-s">S</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="m" id="size-m" />
      <Label htmlFor="size-m">M</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="l" id="size-l" disabled />
      <Label htmlFor="size-l">L (sold out)</Label>
    </div>
  </RadioGroup>
)

export const Disabled = () => (
  <RadioGroup defaultValue="omniva" disabled>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="omniva" id="d-omniva" />
      <Label htmlFor="d-omniva">Omniva parcel locker</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="dpd" id="d-dpd" />
      <Label htmlFor="d-dpd">DPD courier</Label>
    </div>
  </RadioGroup>
)
