import { Label, Textarea } from 'h2bc-web-front'

export const Default = () => (
  <div className="max-w-md space-y-2">
    <Label htmlFor="message">Message</Label>
    <Textarea id="message" placeholder="Tell us what's up..." />
  </div>
)

export const ContactMessage = () => (
  <div className="max-w-md space-y-2">
    <Label htmlFor="contact-message" className="text-sm font-medium tracking-wide">
      Message
    </Label>
    <Textarea
      id="contact-message"
      placeholder="Tell us what's up..."
      className="min-h-32 resize-y"
    />
  </div>
)

export const WithValue = () => (
  <div className="max-w-md space-y-2">
    <Label htmlFor="order-note">Order note</Label>
    <Textarea
      id="order-note"
      defaultValue="Please leave the parcel at the Omniva locker on Gedimino pr. 9, Vilnius."
    />
  </div>
)

export const Disabled = () => (
  <div className="max-w-md space-y-2">
    <Label htmlFor="disabled-note">Order note</Label>
    <Textarea id="disabled-note" disabled placeholder="Notes are locked after payment" />
  </div>
)
