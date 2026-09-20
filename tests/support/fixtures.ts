import { test as base } from "@playwright/test";
import { AdminPage } from "./admin-page";
import { CartPage } from "./cart-page";
import { CheckoutPage } from "./checkout-page";
import { ConsentBanner } from "./consent-banner";
import { ContactPage } from "./contact-page";
import { ContentPage } from "./content-page";
import { getGalleryVideos, saveGalleryVideos } from "./gallery";
import { SeoPage } from "./seo-page";
import { ShopPage } from "./shop-page";
import { blockAnalyticsRequests, declineConsentWhenAsked, setVisitorCountry } from "./visitor";

export const test = base.extend<{
  admin: AdminPage;
  analyticsBlocked: void;
  cart: CartPage;
  checkout: CheckoutPage;
  consent: ConsentBanner;
  consentDeclined: void;
  keepConsentBanner: boolean;
  contact: ContactPage;
  content: ContentPage;
  emptyGallery: void;
  seo: SeoPage;
  shop: ShopPage;
  visitFrom: (country: string) => Promise<void>;
}>({
  admin: async ({ page }, use) => {
    const admin = new AdminPage(page);

    await admin.login();
    await use(admin);
  },
  emptyGallery: async ({ admin, page }, use) => {
    void admin;

    const videos = await getGalleryVideos(page.request);

    await saveGalleryVideos(page.request, []);
    await use();
    await saveGalleryVideos(page.request, videos);
  },
  analyticsBlocked: [
    async ({ page }, use) => {
      await blockAnalyticsRequests(page);
      await use();
    },
    { auto: true },
  ],
  keepConsentBanner: [false, { option: true }],
  consentDeclined: [
    async ({ page, keepConsentBanner }, use) => {
      if (!keepConsentBanner) await declineConsentWhenAsked(page);

      await use();
    },
    { auto: true },
  ],
  consent: async ({ page }, use) => {
    await use(new ConsentBanner(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  contact: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  content: async ({ page }, use) => {
    await use(new ContentPage(page));
  },
  seo: async ({ page, request }, use) => {
    await use(new SeoPage(page, request));
  },
  shop: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  visitFrom: async ({ page }, use) => {
    await use((country) => setVisitorCountry(page, country));
  },
});

export { expect } from "@playwright/test";
