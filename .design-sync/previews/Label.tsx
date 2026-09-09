import { Checkbox, Input, Label } from 'h2bc-web-front'

export const Default = () => <Label htmlFor="city">City</Label>

export const WithInput = () => (
  <div className="max-w-sm space-y-2">
    <Label htmlFor="last-name">Last name</Label>
    <Input id="last-name" placeholder="Petraitis" />
  </div>
)

export const WithCheckbox = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="save-address" defaultChecked />
    <Label htmlFor="save-address">Save this address for next time</Label>
  </div>
)

export const DisabledPeer = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="gift-wrap" disabled />
    <Label htmlFor="gift-wrap">Gift wrapping (unavailable)</Label>
  </div>
)
