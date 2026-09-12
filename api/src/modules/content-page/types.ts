export const CONTENT_PAGE_SLUGS = [
  "privacy",
  "terms",
  "shipping-returns",
  "about",
] as const;

export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];
