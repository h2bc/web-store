import { expect, test } from "./support/fixtures";

test.use({ keepConsentBanner: true });

test("first-time visitor is asked before anything is tracked", async ({ consent }) => {
  await test.step("When a visitor opens the shop for the first time", async () => {
    await consent.open("/about");
  });

  await test.step("Then they see the consent banner with Accept and Decline", async () => {
    await expect(consent.getAcceptButton()).toBeVisible();
    await expect(consent.getDeclineButton()).toBeVisible();
  });
});

test("visitor who accepts is not asked again", async ({ consent }) => {
  await test.step("Given a visitor who accepted", async () => {
    await consent.open("/about");
    await consent.accept();
  });

  await test.step("When they open the shop again", async () => {
    await consent.reload();
  });

  await test.step("Then the banner does not show", async () => {
    await expect(consent.getBanner()).toBeHidden();
  });
});

test("visitor who declines is not asked again", async ({ consent }) => {
  await test.step("Given a visitor who declined", async () => {
    await consent.open("/about");
    await consent.decline();
  });

  await test.step("When they open the shop again", async () => {
    await consent.reload();
  });

  await test.step("Then the banner does not show", async () => {
    await expect(consent.getBanner()).toBeHidden();
  });
});

test("visitor changes the choice from the footer", async ({ consent }) => {
  await test.step("Given a visitor who accepted", async () => {
    await consent.open("/about");
    await consent.accept();
  });

  await test.step("When they reopen the choice from the footer and decline", async () => {
    await consent.reopen();
    await consent.decline();
  });

  await test.step("Then the banner closes and stays closed when they come back", async () => {
    await expect(consent.getBanner()).toBeHidden();
    await consent.reload();
    await expect(consent.getBanner()).toBeHidden();
  });
});
