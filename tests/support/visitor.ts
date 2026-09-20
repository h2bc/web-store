import { type Page } from "@playwright/test";
import { SITE_URL } from "./data";

export async function setVisitorCountry(page: Page, country: string) {
  await page.route(`${SITE_URL}/**`, (route) =>
    route.continue({ headers: { ...route.request().headers(), "cf-ipcountry": country } }),
  );
}
