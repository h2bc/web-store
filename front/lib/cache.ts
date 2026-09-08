import { unstable_cache } from 'next/cache'

const OFF = process.env.DISABLE_CACHE === 'true'

export function cached<F extends (...args: unknown[]) => Promise<unknown>>(
  fn: F,
  key: readonly string[] = [],
  options?: { revalidate?: number; tags?: string[] }
): F {
  return (OFF ? fn : unstable_cache(fn, key as string[], options)) as F
}
