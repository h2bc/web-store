import { test as base } from "@playwright/test";
import { AdminPage } from "./admin-page";
import { CheckoutPage } from "./checkout-page";
import { ContentPage } from "./content-page";
import { getGalleryVideos, saveGalleryVideos } from "./gallery";
import { SeoPage } from "./seo-page";
import { ShopPage } from "./shop-page";

export const test = base.extend<{
  admin: AdminPage;
  checkout: CheckoutPage;
  content: ContentPage;
  emptyGallery: void;
  seo: SeoPage;
  shop: ShopPage;
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
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
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
});

export { expect } from "@playwright/test";
