import { test as base } from "@playwright/test";
import { AdminPage } from "./admin-page";
import { CheckoutPage } from "./checkout-page";
import { ContentPage } from "./content-page";
import { SeoPage } from "./seo-page";

export const test = base.extend<{
  admin: AdminPage;
  checkout: CheckoutPage;
  content: ContentPage;
  seo: SeoPage;
}>({
  admin: async ({ page }, use) => {
    const admin = new AdminPage(page);

    await admin.login();
    await use(admin);
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  content: async ({ page }, use) => {
    await use(new ContentPage(page));
  },
  seo: async ({ page, request }, use) => {
    await use(new SeoPage(page, request));
  },
});

export { expect } from "@playwright/test";
