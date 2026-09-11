import { readFileSync } from "node:fs";

export const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";
export const INDEXABLE = process.env.SEO_INDEXABLE === "true";

export function getStripePublishableKey(): string | undefined {
  if (process.env.STRIPE_PUBLISHABLE_KEY) {
    return process.env.STRIPE_PUBLISHABLE_KEY;
  }

  try {
    const env = readFileSync(new URL("../../front/.env.local", import.meta.url), "utf8");

    return env.match(/^STRIPE_PUBLISHABLE_KEY=(.+)$/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}
