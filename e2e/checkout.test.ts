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

async function fillCard(page: Page, number: string) {
  const frame = paymentFrame(page);
  const cardTab = frame.getByRole("button", { name: "Card" });
  const cardNumber = frame.getByRole("textbox", { name: "Card number" });
  await expect(cardTab.or(cardNumber)).toBeVisible();
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

test("guest checkout with a test card lands on the confirmation page", async ({
  page,
}) => {
  await addFirstProductToCart(page);
  await page.goto("/checkout");

  const continueToDelivery = page.getByRole("button", {
    name: "Continue to delivery",
  });
  await expect(continueToDelivery).toBeDisabled();
  await fillAddress(page);
  await expect(continueToDelivery).toBeEnabled();
  await continueToDelivery.click();

  await expect(page).toHaveURL(/step=delivery/);
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await expect(page).toHaveURL(/step=payment/);
  await expect(
    paymentFrame(page).getByRole("textbox", { name: "Card number" })
  ).toBeVisible();
  const methods = await paymentFrame(page).getByRole("button").allTextContents();
  expect(methods.filter((m) => !/^(Card|Apple Pay|Google Pay)$/.test(m))).toEqual([]);
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
