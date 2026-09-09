import { ProductDescription } from 'h2bc-web-front'

const description = `**Heavyweight 240 gsm cotton**, garment-dyed and pre-shrunk.

- Oversized, drop-shoulder fit
- Screen-printed h2bc logo on the chest
- Made in Europe, ships from Vilnius

Machine wash cold, inside out. Do not tumble dry.`

export const Default = () => (
  <div className="max-w-md">
    <ProductDescription
      subtitle="Oversized heavyweight tee in washed black."
      description={description}
    />
  </div>
)

export const SubtitleOnly = () => (
  <div className="max-w-md">
    <ProductDescription subtitle="Oversized heavyweight tee in washed black." />
  </div>
)

export const DescriptionOnly = () => (
  <div className="max-w-md">
    <ProductDescription description={description} />
  </div>
)
