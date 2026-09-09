import type { Thing, WithContext } from 'schema-dts'

interface JsonLdProps {
  data: WithContext<Thing> | null
}

// Escapes characters that could close the script tag or start HTML inside it.
function safeJson(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export default function JsonLd({ data }: JsonLdProps) {
  if (!data) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson(data) }}
    />
  )
}
