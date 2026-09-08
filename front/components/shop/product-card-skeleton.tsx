import { Skeleton } from '@/components/ui/skeleton'

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      <div className="relative w-full aspect-square">
        <Skeleton className="w-full h-full" />
      </div>

      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-1 h-5 w-1/2" />
    </div>
  )
}
