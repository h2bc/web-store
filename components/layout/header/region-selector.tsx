'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTransition } from 'react'
import type { RegionSummary } from '@/lib/types/region'

interface RegionSelectorProps {
  regions: RegionSummary[]
  currentRegion?: RegionSummary | null
  disabled: boolean
  onRegionChange: (regionId: string) => Promise<void>
}

export default function RegionSelector({
  regions,
  currentRegion,
  disabled,
  onRegionChange,
}: RegionSelectorProps) {
  const [isPending, startTransition] = useTransition()

  const handleRegionChange = (regionId: string) => {
    startTransition(async () => {
      await onRegionChange(regionId)
    })
  }

  if (!currentRegion || regions.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled || isPending}
          className="gap-1 md:px-6"
        >
          {currentRegion.shortName}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48 p-2">
        {regions.map((region) => {
          const isCurrent = region.id === currentRegion?.id

          return (
            <DropdownMenuItem
              key={region.id}
              onClick={() => handleRegionChange(region.id)}
              className={cn(
                'px-5 py-1.5 text-sm',
                isCurrent ? 'font-bold' : 'font-normal'
              )}
            >
              <span className="inline-block w-3">{isCurrent ? '>' : ''}</span>
              <span>{region.name}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
