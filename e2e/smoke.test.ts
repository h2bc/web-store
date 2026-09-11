import { expect, test } from "./support/fixtures";

test("home page loads", async ({ page }) => {
  await test.step("When a shopper opens the home page", async () => {
    const res = await page.goto("/");

    expect(res?.ok()).toBe(true);
  });

  await test.step("Then the page is shown", async () => {
    await expect(page.locator("body")).toBeVisible();
  });
});

test("backend answers its health check", async ({ request }) => {
  await test.step("When the health check is requested", async () => {
    const res = await request.get("http://localhost:9000/health");

    expect(res.ok()).toBe(true);
  });
});
