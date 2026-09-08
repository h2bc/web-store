'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { setShippingMethod } from '@/lib/data/cart'
import type { ShippingOptionSummary } from '@/lib/data/shipping'
import { formatPrice } from '@/lib/utils'

interface DeliveryStepProps {
  options: ShippingOptionSummary[]
  currencyCode?: string
  selectedOptionId?: string
}

export default function DeliveryStep({
  options,
  currencyCode,
  selectedOptionId,
}: DeliveryStepProps) {
  const router = useRouter()
  const [selected, setSelected] = useState(
    selectedOptionId ?? options[0]?.id ?? ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (options.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No delivery options are available for this address.
      </p>
    )
  }

  const handleContinue = async () => {
    if (!selected) return

    setIsSubmitting(true)
    const { error } = await setShippingMethod(selected)

    if (error) {
      toast.error(error)
      setIsSubmitting(false)
      return
    }

    router.push('/checkout?step=payment')
  }

  return (
    <div className="space-y-6">
      <RadioGroup
        value={selected}
        onValueChange={setSelected}
        className="space-y-2"
      >
        {options.map((option) => (
          <Label
            key={option.id}
            htmlFor={option.id}
            className="flex items-center justify-between gap-3 rounded-lg border p-4 cursor-pointer font-normal has-[:checked]:border-foreground"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value={option.id} id={option.id} />
              <span>{option.name}</span>
            </div>
            <span className="font-medium">
              {option.isCalculated && option.amount == null
                ? 'Calculated at checkout'
                : formatPrice(option.amount, currencyCode)}
            </span>
          </Label>
        ))}
      </RadioGroup>

      <Button
        size="lg"
        className="w-full"
        onClick={handleContinue}
        disabled={isSubmitting || !selected}
      >
        {isSubmitting ? 'Saving…' : 'Continue to payment'}
      </Button>
    </div>
  )
}
