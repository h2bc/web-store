import { ProductCardSkeleton } from 'h2bc-web-front'

export const Default = () => (
  <div className="w-64">
    <ProductCardSkeleton />
  </div>
)

export const LoadingGrid = () => (
  <div className="grid grid-cols-4 gap-6">
    <ProductCardSkeleton />
    <ProductCardSkeleton />
    <ProductCardSkeleton />
    <ProductCardSkeleton />
  </div>
)
