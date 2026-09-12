import type { Page } from "@playwright/test";

export class ContentPage {
  constructor(private readonly page: Page) {}

  getTitle() {
    return this.page.getByRole("heading", { level: 1 });
  }

  getSectionHeadings() {
    return this.page.getByRole("heading", { level: 2 });
  }

  getPlayers() {
    return this.page.locator("main iframe");
  }

  getEmptyGalleryMessage() {
    return this.page.getByText("No videos yet");
  }

  getFooterLink(name: string) {
    return this.page.locator("footer").getByRole("link", { name });
  }

  async open(path: string) {
    await this.page.goto(path);
  }
}
