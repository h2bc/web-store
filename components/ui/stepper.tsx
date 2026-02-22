'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export default function Stepper({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  className,
}: StepperProps) {
  const canDecrease = value > min
  const canIncrease = max == null || value < max

  const handleDecrease = () => {
    if (!canDecrease) return
    onChange(value - 1)
  }

  const handleIncrease = () => {
    if (!canIncrease) return
    onChange(value + 1)
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border border-input bg-background px-0.5',
        className
      )}
      role="group"
      aria-label="Stepper"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-transparent hover:text-current active:bg-transparent"
        aria-label="Decrease value"
        disabled={disabled || !canDecrease}
        onClick={handleDecrease}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>

      <div className="flex h-8 min-w-10 items-center justify-center px-2.5 text-center text-sm font-medium tabular-nums">
        {value}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-transparent hover:text-current active:bg-transparent"
        aria-label="Increase value"
        disabled={disabled || !canIncrease}
        onClick={handleIncrease}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
