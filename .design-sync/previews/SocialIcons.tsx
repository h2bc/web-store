import { RightsNotice, SocialIcons } from 'h2bc-web-front'

export const Default = () => <SocialIcons />

export const WithRightsNotice = () => (
  <div className="flex items-center gap-4">
    <RightsNotice />
    <SocialIcons />
  </div>
)

export const InFooterRow = () => (
  <div className="flex w-full items-center justify-between border-t pt-4 text-sm">
    <div className="flex items-center gap-6 text-xs uppercase">
      <span>Privacy Policy</span>
      <span>Shipping &amp; Returns</span>
      <span>Terms &amp; Conditions</span>
    </div>
    <div className="flex items-center gap-4">
      <RightsNotice />
      <SocialIcons />
    </div>
  </div>
)
