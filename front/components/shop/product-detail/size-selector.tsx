'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SizeOption } from '@/lib/types/product-detail'

interface SizeSelectorProps {
  sizes: SizeOption[]
  selectedSize: SizeOption | null
  onSizeChange: (size: SizeOption) => void
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) {
  if (sizes.length === 0) return null

  return (
    <div className="mt-6">
      <div className="mb-2 text-sm text-muted-foreground">Size</div>
      <div className="flex gap-4">
        {sizes.map((s) => (
          <Button
            key={s.value}
            variant="link"
            onClick={() => onSizeChange(s)}
            disabled={!s.available}
            className={cn(
              selectedSize?.value === s.value ? 'font-bold' : 'font-normal',
              !s.available && 'opacity-50 cursor-not-allowed',
              'text-md',
              'p-0'
            )}
          >
            {`${selectedSize?.value === s.value ? '>' : ' '} ${s.value}`}
          </Button>
        ))}
      </div>
    </div>
  )
}
