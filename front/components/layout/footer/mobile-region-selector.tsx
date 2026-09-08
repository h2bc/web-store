'use client'

import { useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { RegionSummary } from '@/lib/types/region'

interface MobileRegionSelectorProps {
  regions: RegionSummary[]
  currentRegion?: RegionSummary | null
  disabled: boolean
  onRegionChange: (regionId: string) => Promise<void>
}

export default function MobileRegionSelector({
  regions,
  currentRegion,
  disabled,
  onRegionChange,
}: MobileRegionSelectorProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isCheckout = usePathname().startsWith('/checkout')

  const handleRegionChange = (regionId: string) => {
    startTransition(async () => {
      await onRegionChange(regionId)
      setOpen(false)
    })
  }

  if (!currentRegion || regions.length === 0 || isCheckout) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        disabled={disabled || isPending}
        className="gap-1 tracking-wide"
        onClick={() => setOpen(true)}
      >
        {currentRegion.shortName}
        <ChevronDown size={16} />
      </Button>

      <SheetContent side="bottom" className="w-full rounded-t-lg pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>Select Region</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-1">
          {regions.map((region) => {
            const isCurrent = region.id === currentRegion?.id

            return (
              <Button
                key={region.id}
                type="button"
                variant="ghost"
                disabled={isPending}
                className={cn(
                  'h-8 w-full justify-start gap-2 px-5 text-left text-sm',
                  isCurrent ? 'font-bold' : 'font-normal'
                )}
                onClick={() => handleRegionChange(region.id)}
              >
                <span className="inline-block w-3">{isCurrent ? '>' : ''}</span>
                <span>{region.name}</span>
              </Button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
