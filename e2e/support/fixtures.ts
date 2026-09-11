import { test as base } from "@playwright/test";
import { CheckoutPage } from "./checkout-page";
import { SeoPage } from "./seo-page";

export const test = base.extend<{ checkout: CheckoutPage; seo: SeoPage }>({
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  seo: async ({ page, request }, use) => {
    await use(new SeoPage(page, request));
  },
});

export { expect } from "@playwright/test";
