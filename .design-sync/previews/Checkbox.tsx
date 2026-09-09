import { Checkbox, Label } from 'h2bc-web-front'

export const States = () => (
  <div className="flex flex-wrap items-center gap-6">
    <Checkbox aria-label="Unchecked" />
    <Checkbox defaultChecked aria-label="Checked" />
    <Checkbox disabled aria-label="Disabled" />
    <Checkbox disabled defaultChecked aria-label="Disabled checked" />
  </div>
)

export const WithLabel = () => (
  <div className="flex max-w-sm flex-col gap-4">
    <div className="flex items-center gap-2">
      <Checkbox id="billing-same" defaultChecked />
      <Label htmlFor="billing-same">Billing address same as shipping</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="newsletter" />
      <Label htmlFor="newsletter">Email me about new drops</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="terms" disabled />
      <Label htmlFor="terms">I agree to the terms and conditions</Label>
    </div>
  </div>
)
