import { Skeleton } from 'h2bc-web-front'

export const ProductCard = () => (
  <div className="flex flex-col items-center w-full max-w-sm mx-auto">
    <div className="relative w-full aspect-square">
      <Skeleton className="w-full h-full" />
    </div>
    <Skeleton className="mt-4 h-6 w-3/4" />
    <Skeleton className="mt-1 h-5 w-1/2" />
  </div>
)

export const TextLines = () => (
  <div className="max-w-sm space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
)

export const CartLine = () => (
  <div className="flex max-w-md items-center gap-4">
    <Skeleton className="h-20 w-20 shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
    <Skeleton className="h-8 w-24" />
  </div>
)
