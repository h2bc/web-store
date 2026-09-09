import { Input, Label } from 'h2bc-web-front'

export const Default = () => (
  <div className="max-w-sm space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
  </div>
)

export const Types = () => (
  <div className="max-w-sm space-y-4">
    <div className="space-y-2">
      <Label htmlFor="first-name">First name</Label>
      <Input id="first-name" type="text" placeholder="Jonas" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="phone">Phone</Label>
      <Input id="phone" type="tel" placeholder="+370 600 00000" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="postal">Postal code</Label>
      <Input id="postal" type="text" placeholder="LT-01103" />
    </div>
  </div>
)

export const WithValue = () => (
  <div className="max-w-sm space-y-2">
    <Label htmlFor="address">Address</Label>
    <Input id="address" defaultValue="Gedimino pr. 9, Vilnius" />
  </div>
)

export const Disabled = () => (
  <div className="max-w-sm space-y-2">
    <Label htmlFor="country">Country</Label>
    <Input id="country" disabled defaultValue="Lithuania" />
  </div>
)
