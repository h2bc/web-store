import { DECLINED_CARD, EMAIL, GERMAN_ADDRESS, LITHUANIAN_ADDRESS, VALID_CARD } from "./support/data";
import { expect, test } from "./support/fixtures";

test("shopper can choose any country we ship to, with Lithuania preselected", async ({
  checkout,
}) => {
  await test.step("Given a shopper with a product in the cart at the address step", async () => {
    await checkout.addFirstProductAndOpenCheckout();
  });

  await test.step("Then Lithuania is preselected and every country we ship to is listed alphabetically", async () => {
    await expect(checkout.getCountryField()).toHaveValue("LT");
    const countries = await checkout
      .getCountryField()
      .locator('option:not([value=""])')
      .allTextContents();

    expect(countries.length).toBeGreaterThan(1);
    expect(countries).toEqual([...countries].sort((a, b) => a.localeCompare(b)));
  });
});

test("shopper gets a delivery option whether they ship to Lithuania or Germany", async ({
  checkout,
}) => {
  await test.step("Given a shopper with a product in the cart at the address step", async () => {
    await checkout.addFirstProductAndOpenCheckout();
  });

  await test.step("When they enter a Lithuanian address and continue", async () => {
    await checkout.fillAddress(LITHUANIAN_ADDRESS);
    await checkout.continueToDelivery();
  });

  await test.step("Then they can choose a delivery option", async () => {
    await expect(checkout.getDeliveryOptions().first()).toBeVisible();
  });

  await test.step("When they switch the address to Germany and continue", async () => {
    await checkout.openAddressStep();
    await expect(checkout.getCountryField()).toHaveValue("LT");
    await checkout.fillAddress(GERMAN_ADDRESS);
    await checkout.continueToDelivery();
  });

  await test.step("Then they can choose a delivery option", async () => {
    await expect(checkout.getDeliveryOptions().first()).toBeVisible();
  });
});

test("shopper whose card is declined is told and can try again", async ({ checkout, page }) => {
  await test.step("Given a shopper at the payment step", async () => {
    await checkout.reachPaymentStep();
  });

  await test.step("When they pay with a card that is declined", async () => {
    await checkout.enterCardDetails(DECLINED_CARD);
    await checkout.placeOrder();
  });

  await test.step("Then they see the error and stay on the payment step", async () => {
    await expect(checkout.getPaymentError()).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/step=payment/);
  });
});

test("shopper who pays by card sees the order confirmation with their email", async ({
  checkout,
  page,
}) => {
  await test.step("Given a shopper at the payment step", async () => {
    await checkout.reachPaymentStep();
  });

  await test.step("When they pay by card", async () => {
    await checkout.enterCardDetails(VALID_CARD);
    await checkout.placeOrder();
  });

  await test.step("Then they see the order confirmation with their email", async () => {
    await expect(page).toHaveURL(/\/order\/.+\/confirmed$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
    await expect(page.getByText(EMAIL).first()).toBeVisible();
  });
});
