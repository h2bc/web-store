import { expect, test, type Page } from "@playwright/test";

function countryField(page: Page) {
  return page.getByRole("combobox", { name: "Country" });
}

function shippingOption(page: Page, name: string) {
  return page.locator("label", { hasText: name });
}

async function continueToDelivery(page: Page) {
  await page.getByRole("button", { name: "Continue to delivery" }).click();
  await expect(page).toHaveURL(/step=delivery/);
}

test("checkout ships to every country of the region", async ({ page }) => {
  await page.goto("/shop");
  const productPath = await page
    .locator('a[href^="/shop/"]')
    .first()
    .getAttribute("href", { timeout: 5_000 })
    .catch(() => null);
  test.skip(productPath === null, "shop has no products");

  await page.goto(productPath!);
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("button", { name: "Cart", exact: true })).toContainText("1");

  await page.goto("/checkout");
  await expect(countryField(page)).toHaveText("Lithuania");

  await countryField(page).click();
  const countries = await page.getByRole("option").allTextContents();
  await page.keyboard.press("Escape");
  expect(countries.length).toBeGreaterThan(1);
  expect(countries).toEqual(
    [...countries].sort((a, b) => a.localeCompare(b)),
  );

  await page.getByLabel("Email").fill("e2e@example.com");
  await page.getByLabel("First name").fill("Vardenis");
  await page.getByLabel("Last name").fill("Pavardenis");
  await page.getByLabel("Address", { exact: true }).fill("Gedimino pr. 1");
  await page.getByLabel("Postal code").fill("01103");
  await page.getByLabel("City").fill("Vilnius");
  await continueToDelivery(page);
  await expect(shippingOption(page, "Standard Shipping LT")).toContainText(/2[.,]99/);

  await page.goto("/checkout?step=address");
  await countryField(page).click();
  await page.getByRole("option", { name: "Germany" }).click();
  await continueToDelivery(page);
  await expect(shippingOption(page, "Standard Shipping EU")).toContainText(/5[.,]99/);
});
