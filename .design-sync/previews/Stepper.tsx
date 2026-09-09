import * as React from 'react'
import { Stepper } from 'h2bc-web-front'

function QuantityStepper({
  initial,
  min,
  max,
  disabled,
}: {
  initial: number
  min?: number
  max?: number
  disabled?: boolean
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <Stepper value={value} onChange={setValue} min={min} max={max} disabled={disabled} />
  )
}

export const Default = () => <QuantityStepper initial={2} min={1} max={10} />

export const Limits = () => (
  <div className="flex flex-wrap items-center gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">At minimum</span>
      <QuantityStepper initial={1} min={1} max={5} />
    </div>
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">At maximum</span>
      <QuantityStepper initial={5} min={1} max={5} />
    </div>
  </div>
)

export const Disabled = () => <QuantityStepper initial={1} min={1} max={3} disabled />

export const InCartLine = () => (
  <div className="flex max-w-md items-center justify-between gap-4">
    <div className="flex flex-col">
      <span className="font-medium">Blackletter Hoodie</span>
      <span className="text-sm text-muted-foreground">Size M</span>
    </div>
    <QuantityStepper initial={1} min={1} max={4} />
    <span className="font-medium tabular-nums">€54,00 EUR</span>
  </div>
)
