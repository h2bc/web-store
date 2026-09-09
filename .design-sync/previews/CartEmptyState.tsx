import { CartEmptyState } from 'h2bc-web-front'

export const Default = () => <CartEmptyState />

export const InDrawer = () => (
  <div className="flex h-64 w-full max-w-xs items-center justify-center border rounded-lg">
    <CartEmptyState />
  </div>
)

export const CustomClassName = () => (
  <CartEmptyState className="py-12 text-left" buttonClassName="w-48" />
)
