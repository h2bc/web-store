import { CONTENT_PAGES, FIRST_GALLERY_VIDEO_ID } from "./support/data";
import { expect, test } from "./support/fixtures";

for (const { path, label } of CONTENT_PAGES) {
  test(`shopper reads the ${label} page`, async ({ content }) => {
    await test.step(`When a shopper opens ${path}`, async () => {
      await content.open(path);
    });

    await test.step("Then they see the page title and its sections", async () => {
      await expect(content.getTitle()).toHaveText(label);
      await expect(content.getSectionHeadings().first()).toBeVisible();
    });
  });
}

test("shopper watches the gallery videos in the owner's order", async ({ content }) => {
  await test.step("When a shopper opens the gallery", async () => {
    await content.open("/gallery");
  });

  await test.step("Then they see the three seeded players, the first one first", async () => {
    await expect(content.getPlayers()).toHaveCount(3);
    await expect(content.getPlayers().first()).toHaveAttribute(
      "src",
      new RegExp(FIRST_GALLERY_VIDEO_ID),
    );
  });
});

test("shopper reaches the terms from the cart footer", async ({ content, page }) => {
  await test.step("Given a shopper on the cart", async () => {
    await content.open("/cart");
  });

  await test.step("When they follow the Terms & Conditions footer link", async () => {
    await content.getFooterLink("Terms & Conditions").click();
  });

  await test.step("Then the terms page opens", async () => {
    await expect(page).toHaveURL(/\/terms$/);
    await expect(content.getTitle()).toHaveText("Terms & Conditions");
  });
});

test("shopper is told that placing the order accepts the terms and the privacy policy", async ({
  checkout,
}) => {
  await test.step("Given a shopper at the payment step", async () => {
    await checkout.reachPaymentStep();
  });

  await test.step("Then both policies are linked next to the Place order button and open in a new tab", async () => {
    await expect(checkout.getConsentLink("Terms & Conditions")).toHaveAttribute("href", "/terms");
    await expect(checkout.getConsentLink("Terms & Conditions")).toHaveAttribute("target", "_blank");
    await expect(checkout.getConsentLink("Privacy Policy")).toHaveAttribute("href", "/privacy");
    await expect(checkout.getConsentLink("Privacy Policy")).toHaveAttribute("target", "_blank");
  });
});
