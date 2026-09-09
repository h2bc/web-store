import { NoProductsLabel } from 'h2bc-web-front'

export const Default = () => <NoProductsLabel />

export const InGrid = () => (
  <div className="grid grid-cols-2 gap-6 border-t">
    <NoProductsLabel />
  </div>
)
