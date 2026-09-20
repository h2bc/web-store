import { type Page } from "@playwright/test";
import { ANALYTICS_REQUESTS, SITE_URL } from "./data";

export async function setVisitorCountry(page: Page, country: string) {
  await page.route(`${SITE_URL}/**`, (route) =>
    route.fallback({ headers: { ...route.request().headers(), "cf-ipcountry": country } }),
  );
}

export async function blockAnalyticsRequests(page: Page) {
  await page.route(ANALYTICS_REQUESTS, (route) => route.abort());
}

export async function declineConsentWhenAsked(page: Page) {
  const banner = page.getByRole("region", { name: "Cookie consent" });

  await page.addLocatorHandler(banner, () =>
    banner.getByRole("button", { name: "Decline" }).click(),
  );
}
