import { type Page } from "@playwright/test";
import { type ContactMessage } from "./data";

export class ContactPage {
  constructor(private readonly page: Page) {}

  getInstagramLink() {
    return this.page.locator("main").getByRole("link", { name: "Instagram" });
  }

  getMessageField() {
    return this.page.getByLabel("Message");
  }

  getSendButton() {
    return this.page.getByRole("button", { name: "Send Message" });
  }

  getSentConfirmation() {
    return this.page.getByText("Message sent");
  }

  getSendAnotherButton() {
    return this.page.getByRole("button", { name: "Send another message" });
  }

  async open() {
    await this.page.goto("/contact");
  }

  async fillMessage({ name, email, topic, message }: ContactMessage) {
    await this.page.getByLabel("Name").fill(name);
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByRole("combobox", { name: "Topic" }).click();
    await this.page.getByRole("option", { name: topic }).click();
    await this.getMessageField().fill(message);
  }

  async send() {
    await this.getSendButton().click();
  }
}
