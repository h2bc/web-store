// Lets next/link and next/image run outside the Next.js runtime (Claude Design
// renders the bundle in a plain browser). Next's client modules read
// process.env.__NEXT_* at module init, and next/image reads
// process.env.__NEXT_IMAGE_OPTS as a config object; unoptimized makes it emit a
// plain <img src> instead of a /_next/image URL that only the app can serve.
// Must be the barrel's first import so it runs before any Next module.
import { imageConfigDefault } from 'next/dist/shared/lib/image-config'

const g = globalThis as { process?: { env: Record<string, unknown> } }
g.process ??= { env: {} }
g.process.env ??= {}
g.process.env.__NEXT_IMAGE_OPTS ??= { ...imageConfigDefault, unoptimized: true }
