import { RightsNotice, SocialIcons } from 'h2bc-web-front'

export const Default = () => <RightsNotice />

export const InFooterRow = () => (
  <div className="flex w-full items-center justify-between border-t pt-4 text-sm">
    <span className="text-xs uppercase">Shipping &amp; Returns</span>
    <div className="flex items-center gap-4">
      <RightsNotice />
      <SocialIcons />
    </div>
  </div>
)
