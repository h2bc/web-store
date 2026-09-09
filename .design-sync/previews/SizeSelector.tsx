import * as React from 'react'
import { SizeSelector } from 'h2bc-web-front'

type SizeOption = { value: string; available: boolean; option_id: string }

const OPTION_ID = 'opt_size'
const sizes: SizeOption[] = [
  { value: 'S', available: true, option_id: OPTION_ID },
  { value: 'M', available: true, option_id: OPTION_ID },
  { value: 'L', available: true, option_id: OPTION_ID },
  { value: 'XL', available: false, option_id: OPTION_ID },
]

function Stateful({ initial }: { initial: SizeOption | null }) {
  const [selected, setSelected] = React.useState<SizeOption | null>(initial)
  return (
    <SizeSelector sizes={sizes} selectedSize={selected} onSizeChange={setSelected} />
  )
}

export const Default = () => <Stateful initial={sizes[1]} />

export const NothingSelected = () => <Stateful initial={null} />

export const OneSize = () => (
  <SizeSelector
    sizes={[{ value: 'ONE SIZE', available: true, option_id: OPTION_ID }]}
    selectedSize={{ value: 'ONE SIZE', available: true, option_id: OPTION_ID }}
    onSizeChange={() => {}}
  />
)

export const MostlySoldOut = () => (
  <SizeSelector
    sizes={[
      { value: 'S', available: false, option_id: OPTION_ID },
      { value: 'M', available: false, option_id: OPTION_ID },
      { value: 'L', available: true, option_id: OPTION_ID },
      { value: 'XL', available: false, option_id: OPTION_ID },
    ]}
    selectedSize={{ value: 'L', available: true, option_id: OPTION_ID }}
    onSizeChange={() => {}}
  />
)
