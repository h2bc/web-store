import { expect, type Page } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  getHeaderButton() {
    return this.page.getByRole("button", { name: "Cart", exact: true });
  }

  getHeaderBadge() {
    return this.getHeaderButton().getByText(/^\d+$/);
  }

  getPreview() {
    return this.page.getByRole("dialog", { name: "Your cart" });
  }

  getLineItem(name: string) {
    return this.page.locator("main").getByRole("link", { name, exact: true }).first();
  }

  getPreviewItem(name: string) {
    return this.getPreview().getByRole("link", { name, exact: true }).first();
  }

  getItemCount() {
    return this.page.locator("main").getByText(/^\d+ items?$/);
  }

  getSubtotal() {
    return this.page.locator("main").getByText("Subtotal");
  }

  getIncreaseButton() {
    return this.page.locator("main").getByRole("button", { name: "Increase value" });
  }

  getRemoveButton() {
    return this.page.locator("main").getByRole("button", { name: "Remove item" });
  }

  getEmptyState() {
    return this.page.locator("main").getByText("Cart empty");
  }

  getCheckoutLink() {
    return this.page.getByRole("link", { name: "Checkout" });
  }

  async addProduct(name: string) {
    await this.page.goto("/shop");
    await this.page.getByRole("link", { name: `View ${name}` }).click();
    await this.page.getByRole("button", { name: "Add to cart" }).click();
    await expect(this.getHeaderBadge()).toBeVisible({ timeout: 15_000 });
  }

  async open() {
    await this.page.goto("/cart");
  }

  async openPreview() {
    await this.getHeaderButton().click();
  }
}
