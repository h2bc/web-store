import type { Thing, WithContext } from 'schema-dts'

interface JsonLdProps {
  data: WithContext<Thing> | null
}

export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
