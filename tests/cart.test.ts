import { STOCKED_PRODUCT } from "./support/data";
import { expect, test } from "./support/fixtures";

test("shopper adds a product and finds it in the cart", async ({ cart }) => {
  await test.step("Given a shopper with an empty cart", async () => {
    await cart.open();
    await expect(cart.getEmptyState()).toBeVisible();
  });

  await test.step("When they add a stocked product", async () => {
    await cart.addProduct(STOCKED_PRODUCT);
  });

  await test.step("Then the header counts one item and the cart page lists it with a subtotal", async () => {
    await expect(cart.getHeaderBadge()).toHaveText("1");
    await cart.open();
    await expect(cart.getLineItem(STOCKED_PRODUCT)).toBeVisible();
    await expect(cart.getItemCount()).toHaveText(/^1 item$/);
    await expect(cart.getSubtotal()).toBeVisible();
    await expect(cart.getCheckoutLink()).toBeVisible();
  });
});

test("shopper opens the cart preview from the header", async ({ cart }) => {
  await test.step("Given a shopper with a product in the cart", async () => {
    await cart.addProduct(STOCKED_PRODUCT);
  });

  await test.step("When they press the cart button", async () => {
    await cart.openPreview();
  });

  await test.step("Then the preview lists the product and leads to checkout", async () => {
    await expect(cart.getPreview()).toBeVisible();
    await expect(cart.getPreviewItem(STOCKED_PRODUCT)).toBeVisible();
    await expect(cart.getPreview().getByRole("link", { name: "Checkout" })).toBeVisible();
  });
});

test("shopper raises the quantity and the summary follows", async ({ cart }) => {
  await test.step("Given a shopper with one of a product in the cart", async () => {
    await cart.addProduct(STOCKED_PRODUCT);
    await cart.open();
  });

  await test.step("When they raise the quantity to two", async () => {
    await cart.getIncreaseButton().click();
  });

  await test.step("Then the summary and the header count two items", async () => {
    await expect(cart.getItemCount()).toHaveText(/^2 items$/);
    await expect(cart.getHeaderBadge()).toHaveText("2");
  });
});

test("shopper's cart stays hidden from page scripts and other sites", async ({ cart }) => {
  await test.step("Given a shopper with an empty cart", async () => {
    await cart.open();
  });

  const header = await test.step("When they add a stocked product", () =>
    cart.addProductAndGetCartCookieHeader(STOCKED_PRODUCT),
  );

  await test.step("Then the cart cookie is HttpOnly and SameSite Lax", async () => {
    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/SameSite=Lax/i);
  });
});

test("shopper removes the last item and sees the empty cart", async ({ cart }) => {
  await test.step("Given a shopper with a product in the cart", async () => {
    await cart.addProduct(STOCKED_PRODUCT);
    await cart.open();
  });

  await test.step("When they remove it", async () => {
    await cart.getRemoveButton().click();
  });

  await test.step("Then the cart is empty and the header shows no count", async () => {
    await expect(cart.getEmptyState()).toBeVisible();
    await expect(cart.getHeaderBadge()).toHaveCount(0);
  });
});
