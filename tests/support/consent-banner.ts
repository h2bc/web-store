import type { Page } from "@playwright/test";

export class ConsentBanner {
  constructor(private readonly page: Page) {}

  getBanner() {
    return this.page.getByRole("region", { name: "Cookie consent" });
  }

  getAcceptButton() {
    return this.getBanner().getByRole("button", { name: "Accept" });
  }

  getDeclineButton() {
    return this.getBanner().getByRole("button", { name: "Decline" });
  }

  async open(path: string) {
    await this.page.goto(path);
  }

  async accept() {
    await this.getAcceptButton().click();
  }

  async decline() {
    await this.getDeclineButton().click();
  }

  async reopen() {
    await this.page.locator("footer").getByRole("button", { name: "Cookies" }).click();
  }

  async reload() {
    await this.page.reload();
  }
}
