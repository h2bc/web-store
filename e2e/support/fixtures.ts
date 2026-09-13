import { test as base } from "@playwright/test";
import { CheckoutPage } from "./checkout-page";
import { ContactPage } from "./contact-page";
import { SeoPage } from "./seo-page";

export const test = base.extend<{ checkout: CheckoutPage; contact: ContactPage; seo: SeoPage }>({
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  contact: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  seo: async ({ page, request }, use) => {
    await use(new SeoPage(page, request));
  },
});

export { expect } from "@playwright/test";
