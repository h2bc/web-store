import { expect, test } from "@playwright/test";

test("storefront renders", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.ok()).toBe(true);
  await expect(page.locator("body")).toBeVisible();
});

test("api is healthy", async ({ request }) => {
  const res = await request.get("http://localhost:9000/health");
  expect(res.ok()).toBe(true);
});
