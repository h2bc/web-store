import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type FrameLocator, type Page } from "@playwright/test";

const EMAIL = "e2e@example.com";

function stripePublishableKey(): string | undefined {
  if (process.env.STRIPE_PUBLISHABLE_KEY) {
    return process.env.STRIPE_PUBLISHABLE_KEY;
  }
  try {
    const env = readFileSync(path.join(__dirname, "../front/.env.local"), "utf8");
    return env.match(/^STRIPE_PUBLISHABLE_KEY=(.+)$/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

test.skip(!stripePublishableKey(), "STRIPE_PUBLISHABLE_KEY is not set");

async function addFirstProductToCart(page: Page) {
  await page.goto("/shop");
  await page.locator('a[href^="/shop/"]').first().click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("button", { name: "Add to cart" })).toBeEnabled();
}

function addressFrame(page: Page): FrameLocator {
  return page.frameLocator('iframe[title="Secure address input frame"]');
}

function paymentFrame(page: Page): FrameLocator {
  return page.frameLocator('main iframe[title="Secure payment input frame"]');
}

function countryField(page: Page) {
  return addressFrame(page).getByRole("combobox", {
    name: "Country or region",
    exact: true,
  });
}

function shippingOption(page: Page, name: string) {
  return page.locator("label", { hasText: name });
}

async function fillAddress(page: Page) {
  await page.getByLabel("Email").fill(EMAIL);
  const frame = addressFrame(page);
  await frame.getByRole("textbox", { name: "First name" }).fill("Jane");
  await frame.getByRole("textbox", { name: "Last name" }).fill("Doe");
  await frame.getByRole("textbox", { name: "Address line 1" }).fill("Gedimino pr. 1");
  await frame.getByRole("textbox", { name: "Postal code" }).fill("01103");
  await frame.getByRole("textbox", { name: "City" }).fill("Vilnius");
  await page.getByLabel("Email").click();
}

async function continueToDelivery(page: Page) {
  const button = page.getByRole("button", { name: "Continue to delivery" });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page).toHaveURL(/step=delivery/);
}

async function fillCard(page: Page, number: string) {
  const frame = paymentFrame(page);
  const cardTab = frame.getByRole("button", { name: "Card" });
  const cardNumber = frame.getByRole("textbox", { name: "Card number" });
  await expect(cardTab.or(cardNumber).first()).toBeVisible();
  if (
    (await cardTab.isVisible()) &&
    (await cardTab.getAttribute("aria-expanded")) !== "true"
  ) {
    await cardTab.click();
  }
  await frame.getByRole("textbox", { name: "Card number" }).fill(number);
  await frame.getByRole("textbox", { name: /Expiration/ }).fill("1234");
  await frame.getByRole("textbox", { name: "Security code" }).fill("123");
}

test("checkout ships to every country of the region", async ({ page }) => {
  await addFirstProductToCart(page);
  await page.goto("/checkout");

  await expect(countryField(page)).toHaveValue("LT");
  const countries = await countryField(page)
    .locator('option:not([value=""])')
    .allTextContents();
  expect(countries.length).toBeGreaterThan(1);
  expect(countries).toEqual(
    [...countries].sort((a, b) => a.localeCompare(b)),
  );

  await fillAddress(page);
  await continueToDelivery(page);
  await expect(shippingOption(page, "Standard Shipping LT")).toContainText(/2[.,]99/);

  await page.goto("/checkout?step=address");
  await expect(countryField(page)).toHaveValue("LT");
  await countryField(page).selectOption("DE");
  await addressFrame(page).getByRole("textbox", { name: "Postal code" }).fill("10115");
  await addressFrame(page).getByRole("textbox", { name: "City" }).fill("Berlin");
  await page.getByLabel("Email").click();
  await continueToDelivery(page);
  await expect(shippingOption(page, "Standard Shipping EU")).toContainText(/5[.,]99/);
});

test("guest checkout with a test card lands on the confirmation page", async ({
  page,
}) => {
  await addFirstProductToCart(page);
  await page.goto("/checkout");

  const continueButton = page.getByRole("button", {
    name: "Continue to delivery",
  });
  await expect(continueButton).toBeDisabled();
  await fillAddress(page);
  await continueToDelivery(page);

  await page.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page).toHaveURL(/step=payment/);
  await fillCard(page, "4000000000000002");
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("declined");
  await expect(page).toHaveURL(/step=payment/);

  await fillCard(page, "4242424242424242");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page).toHaveURL(/\/order\/.+\/confirmed$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  await expect(page.getByText(/Order #\d+ was placed/)).toBeVisible();
  await expect(page.getByText(EMAIL).first()).toBeVisible();
});
