import {
  DECLINED_CARD,
  EMAIL,
  GERMAN_ADDRESS,
  LITHUANIAN_ADDRESS,
  OTHER_SHIPPED_TO_COUNTRY,
  SHIPPED_TO_COUNTRY,
  UNSUPPORTED_COUNTRY,
  VALID_CARD,
} from "./support/data";
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

test("shopper from a country we ship to sees their own country preselected", async ({
  checkout,
  visitFrom,
}) => {
  await test.step("Given a shopper visiting from Germany", async () => {
    await visitFrom(SHIPPED_TO_COUNTRY);
  });

  await test.step("When they open the address step with a product in the cart", async () => {
    await checkout.addFirstProductAndOpenCheckout();
  });

  await test.step("Then Germany is preselected", async () => {
    await expect(checkout.getCountryField()).toHaveValue(SHIPPED_TO_COUNTRY);
  });
});

test("shopper from a country we do not ship to sees Lithuania preselected", async ({
  checkout,
  visitFrom,
}) => {
  await test.step("Given a shopper visiting from a country outside the region", async () => {
    await visitFrom(UNSUPPORTED_COUNTRY);
  });

  await test.step("When they open the address step with a product in the cart", async () => {
    await checkout.addFirstProductAndOpenCheckout();
  });

  await test.step("Then Lithuania is preselected", async () => {
    await expect(checkout.getCountryField()).toHaveValue(LITHUANIAN_ADDRESS.country);
  });
});

test("shopper who saved a German address keeps Germany when visiting from another country", async ({
  checkout,
  visitFrom,
}) => {
  await test.step("Given a shopper from Latvia who saved a German address", async () => {
    await visitFrom(OTHER_SHIPPED_TO_COUNTRY);
    await checkout.addFirstProductAndOpenCheckout();
    await checkout.fillAddress(GERMAN_ADDRESS);
    await checkout.continueToDelivery();
  });

  await test.step("When they return to the address step", async () => {
    await checkout.openAddressStep();
  });

  await test.step("Then Germany is still selected", async () => {
    await expect(checkout.getCountryField()).toHaveValue(GERMAN_ADDRESS.country);
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

  const chosen = await test.step("When they continue with the chosen delivery option", async () => {
    const name = await checkout.getChosenDeliveryName().textContent();

    await checkout.continueToPayment();

    return name!.trim();
  });

  await test.step("Then the delivery step names it", async () => {
    await expect(checkout.getDeliverySummary(chosen)).toBeVisible();
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
    await expect(page.getByText(/^Thank you/)).toBeVisible();
    await expect(page.getByText(EMAIL).first()).toBeVisible();
  });
});
