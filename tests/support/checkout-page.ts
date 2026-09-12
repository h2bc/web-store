import { expect, type FrameLocator, type Page } from "@playwright/test";
import { type Address, EMAIL, LITHUANIAN_ADDRESS } from "./data";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  getStripeAddressFrame(): FrameLocator {
    return this.page.frameLocator('iframe[title="Secure address input frame"]');
  }

  getStripePaymentFrame(): FrameLocator {
    return this.page.frameLocator('main iframe[title="Secure payment input frame"]');
  }

  getCountryField() {
    return this.getStripeAddressFrame().getByRole("combobox", {
      name: "Country or region",
      exact: true,
    });
  }

  getDeliveryOptions() {
    return this.page.getByRole("radio");
  }

  getPlaceOrderButton() {
    return this.page.getByRole("button", { name: "Place order" });
  }

  getPaymentError() {
    return this.page.locator("main").getByRole("alert");
  }

  getConsentLink(name: string) {
    return this.page.locator("main").getByRole("link", { name });
  }

  async addFirstProductAndOpenCheckout() {
    await this.page.goto("/shop");
    await this.page.getByRole("link", { name: /^View / }).first().click();
    await this.page.getByRole("button", { name: "Add to cart" }).click();
    await expect(this.page.getByRole("button", { name: "Add to cart" })).toBeEnabled();
    await this.page.goto("/checkout");
  }

  async openAddressStep() {
    await this.page.goto("/checkout?step=address");
  }

  async fillAddress(address: Address) {
    const frame = this.getStripeAddressFrame();

    await expect(
      this.page.getByLabel("Email"),
      "checkout is disabled: STRIPE_PUBLISHABLE_KEY is not set",
    ).toBeVisible();
    await this.page.getByLabel("Email").fill(EMAIL);
    await this.getCountryField().selectOption(address.country);
    await frame.getByRole("textbox", { name: "First name" }).fill("Jane");
    await frame.getByRole("textbox", { name: "Last name" }).fill("Doe");
    await frame.getByRole("textbox", { name: "Address line 1" }).fill(address.line1);
    await frame.getByRole("textbox", { name: "Postal code" }).fill(address.postalCode);
    await frame.getByRole("textbox", { name: "City" }).fill(address.city);
    await this.page.getByLabel("Email").click();
  }

  async continueToDelivery() {
    const button = this.page.getByRole("button", { name: "Continue to delivery" });

    await expect(button).toBeEnabled();
    await button.click();
    await expect(this.page).toHaveURL(/step=delivery/);
  }

  async continueToPayment() {
    await this.page.getByRole("button", { name: "Continue to payment" }).click();
    await expect(this.page).toHaveURL(/step=payment/);
  }

  async reachPaymentStep() {
    await this.addFirstProductAndOpenCheckout();
    await this.fillAddress(LITHUANIAN_ADDRESS);
    await this.continueToDelivery();
    await this.continueToPayment();
  }

  async enterCardDetails(cardNumber: string) {
    const frame = this.getStripePaymentFrame();
    const number = frame.getByRole("textbox", { name: "Card number" });

    await expect(this.getPlaceOrderButton()).toBeEnabled();
    await expect(async () => {
      if (await number.isVisible()) return;
      await frame.getByRole("button", { name: "Card" }).click();
      await expect(number).toBeVisible({ timeout: 2_000 });
    }).toPass();
    await number.fill(cardNumber);
    await frame.getByRole("textbox", { name: /Expiration/ }).fill("1234");
    await frame.getByRole("textbox", { name: "Security code" }).fill("123");
  }

  async placeOrder() {
    const button = this.getPlaceOrderButton();

    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeInViewport({ ratio: 1 });
    await button.click();
  }
}
