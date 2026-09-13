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

  getFirstRow() {
    return this.page.getByRole("row").nth(1);
  }

  getRows() {
    return this.page.getByRole("row");
  }

  getCreateButton() {
    return this.page.getByRole("button", { name: "Create" });
  }

  getInvalidField(label: string) {
    return this.getDialog().getByLabel(label).and(this.page.locator("[aria-invalid='true']"));
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

  async editVideoTitle(title: string, newTitle: string) {
    await this.openRowMenu(title);
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
    await this.getDialog().getByLabel("Title").fill(newTitle);
    await this.getDialog().getByRole("button", { name: "Save" }).click();
    await expect(this.getDialog()).toBeHidden();
  }

  async moveVideo(title: string, direction: "up" | "down") {
    await this.page.getByRole("button", { name: "Edit ranking" }).click();

    const handle = this.getDialog().getByRole("button", { name: `Drag ${title}` });

    await handle.focus();

    for (const key of ["Space", direction === "up" ? "ArrowUp" : "ArrowDown", "Space"]) {
      await this.page.keyboard.press(key);
      await this.page.waitForTimeout(300);
    }

    await this.page.keyboard.press("Escape");
    await expect(this.getDialog()).toBeHidden();
  }

  async deleteVideo(title: string) {
    await this.openRowMenu(title);
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await this.page.getByRole("button", { name: "Delete" }).click();
  }

  async editPageBody(body: string) {
    await this.editPageField("Body", body);
  }

  async editPageDescription(description: string) {
    await this.editPageField("Meta description", description);
  }

  async editPageTitle(title: string) {
    await this.editPageField("Title", title);
  }

  async saveClearedBody(description: string) {
    await this.openEditor();
    await this.getDialog().getByLabel("Meta description").fill(description);
    await this.getDialog().getByLabel("Body").fill("");
    await this.getDialog().getByRole("button", { name: "Save" }).click();
  }

  async getBodyDraft(): Promise<string> {
    return this.getDraft("Body");
  }

  async getDescriptionDraft(): Promise<string> {
    return this.getDraft("Meta description");
  }

  async getTitleDraft(): Promise<string> {
    return this.getDraft("Title");
  }

  private async editPageField(label: string, value: string) {
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

  private async openRowMenu(title: string) {
    await this.getRow(title).getByRole("button").click();
  }

  private async openEditor() {
    await this.page.getByRole("main").getByRole("button").first().click();
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
  }
}
