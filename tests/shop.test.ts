import { MULTI_VARIANT_PRODUCT, STOCKED_PRODUCT } from "./support/data";
import { expect, test } from "./support/fixtures";

test("shopper sees every product in the shop with its price", async ({ shop }) => {
  await test.step("Given the seeded catalog", async () => {
    await shop.open();
    await expect(shop.getProductCards().first()).toBeVisible();
  });

  await test.step("When they look over the product cards", async () => {
    await expect(shop.getProductCard(STOCKED_PRODUCT)).toBeVisible();
  });

  await test.step("Then every card shows a price and the stocked product is not sold out", async () => {
    await expect(shop.getPrices()).toHaveCount(await shop.getProductCards().count());
    await expect(shop.getSoldOutBadge(STOCKED_PRODUCT)).toHaveCount(0);
  });
});

test("shopper sees a product's image, sizes and price on its page", async ({ shop }) => {
  await test.step("Given the shop", async () => {
    await shop.open();
  });

  await test.step("When they open a product that comes in several sizes", async () => {
    await shop.getProductCard(MULTI_VARIANT_PRODUCT).click();
  });

  await test.step("Then they see its name, an image, more than one size, the price and Add to cart", async () => {
    await expect(shop.getProductName()).toHaveText(MULTI_VARIANT_PRODUCT);
    await expect(shop.getProductImage(MULTI_VARIANT_PRODUCT)).toBeVisible();
    await expect(shop.getSizeOptions().nth(1)).toBeVisible();
    await expect(shop.getPrices().first()).toBeVisible();
    await expect(shop.getAddToCartButton()).toBeVisible();
  });
});
