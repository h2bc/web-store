import { expect, type Page } from "@playwright/test";
import { API_URL, TEST_ADMIN } from "./data";

const ADMIN_URL = `${API_URL}/app`;

export class AdminPage {
  constructor(private readonly page: Page) {}

  getSidebarLink(name: string) {
    return this.page.getByRole("navigation").getByRole("link", { name, exact: true });
  }

  getDialog() {
    return this.page.getByRole("dialog");
  }

  getRow(title: string) {
    return this.page.getByRole("row", { name: title });
  }

  getLastRow() {
    return this.page.getByRole("row").last();
  }

  getBodyText(text: string) {
    return this.page.getByText(text);
  }

  getTitleRow() {
    return this.page.getByText("Title", { exact: true }).locator("..");
  }

  async login() {
    await this.page.goto(`${ADMIN_URL}/login`);
    await this.page.locator('input[name="email"]').fill(TEST_ADMIN.email);
    await this.page.locator('input[name="password"]').fill(TEST_ADMIN.password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForURL((url) => !url.pathname.endsWith("/login"));
  }

  async open(screen: string) {
    await this.page.goto(`${ADMIN_URL}/${screen}`);
  }

  async submitVideo(link: string, title: string) {
    await this.page.getByRole("button", { name: "Create" }).click();
    await this.getDialog().getByLabel("YouTube link").fill(link);
    await this.getDialog().getByLabel("Title").fill(title);
    await this.getDialog().getByRole("button", { name: "Save" }).click();
  }

  async deleteVideo(title: string) {
    await this.page.getByRole("button", { name: `Actions for ${title}` }).click();
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await this.page.getByRole("button", { name: "Delete" }).click();
  }

  async editPageBody(body: string) {
    await this.editField("Body", body);
  }

  async editPageTitle(title: string) {
    await this.editField("Title", title);
  }

  async getBodyDraft(): Promise<string> {
    return this.getDraft("Body");
  }

  async getTitleDraft(): Promise<string> {
    return this.getDraft("Title");
  }

  private async editField(label: string, value: string) {
    await this.openEditor();
    await this.getDialog().getByLabel(label).fill(value);
    await this.getDialog().getByRole("button", { name: "Save" }).click();
    await expect(this.getDialog()).toBeHidden();
  }

  private async getDraft(label: string): Promise<string> {
    await this.openEditor();

    const value = await this.getDialog().getByLabel(label).inputValue();

    await this.getDialog().getByRole("button", { name: "Cancel" }).click();

    return value;
  }

  private async openEditor() {
    await this.page.getByRole("button", { name: "Actions" }).click();
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
  }
}
