import { type Page } from "@playwright/test";
import { PRICE_PATTERN } from "./data";

const SIZE_PATTERN = /^(XS|S|M|L|XL|XXL)$/;

export class ShopPage {
  constructor(private readonly page: Page) {}

  getProductCards() {
    return this.page.getByRole("link", { name: /^View / });
  }

  getProductCard(name: string) {
    return this.page.getByRole("link", { name: `View ${name}` });
  }

  getPrices() {
    return this.page.locator("main").getByText(PRICE_PATTERN);
  }

  getSoldOutBadge(name: string) {
    return this.getProductCard(name).getByText("Sold Out");
  }

  getProductName() {
    return this.page.getByRole("heading", { level: 1 });
  }

  getProductImage(name: string) {
    return this.page.getByRole("img", { name, exact: true }).first();
  }

  getSizeOptions() {
    return this.page.locator("main").getByRole("button", { name: SIZE_PATTERN });
  }

  getAddToCartButton() {
    return this.page.getByRole("button", { name: "Add to cart" });
  }

  async open() {
    await this.page.goto("/shop");
  }
}
