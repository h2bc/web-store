import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows";
import fs from "fs/promises";
import path from "path";

export default async function seedProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillment = container.resolve(Modules.FULFILLMENT);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);

  const [salesChannel] = await salesChannelService.listSalesChannels({});
  const [shippingProfile] = await fulfillment.listShippingProfiles({
    type: "default",
  });
  const [stockLocation] = await container
    .resolve(Modules.STOCK_LOCATION)
    .listStockLocations({});

  if (!salesChannel || !shippingProfile || !stockLocation) {
    throw new Error("Seed the store before the products");
  }

  const assetsDir = path.join(process.cwd(), "assets");

  const uploadAsset = async (relativePath: string) => {
    const filePath = path.join(assetsDir, relativePath);
    const [{ url }] = (
      await uploadFilesWorkflow(container).run({
        input: {
          files: [
            {
              filename: path.basename(filePath),
              mimeType: "image/png",
              content: (await fs.readFile(filePath)).toString("base64"),
              access: "public",
            },
          ],
        },
      })
    ).result;

    return url;
  };

  logger.info("Categories");
  const { result: categories } = await createProductCategoriesWorkflow(
    container,
  ).run({
    input: {
      product_categories: [
        {
          name: "PRINT ON DEMAND",
          handle: "print-on-demand",
          is_active: true,
          rank: 0,
          metadata: {
            alert:
              "This item is printed on demand. It make take 7-14 days to ship your oder",
          },
        },
        { name: "BEANIES", handle: "bean", is_active: true, rank: 1 },
        { name: "BELTS", handle: "belts", is_active: true, rank: 2 },
        { name: "JEWELLERY", handle: "jewellery", is_active: true, rank: 3 },
      ],
    },
  });

  const pod = categories.find((c) => c.handle === "print-on-demand")!.id;
  const beanies = categories.find((c) => c.handle === "bean")!.id;
  const belts = categories.find((c) => c.handle === "belts")!.id;

  logger.info("Upload assets");
  const assetUrls = {
    meduzaTeeFront: await uploadAsset("meduza tee/meduza-tee-front.png"),
    meduzaTeeBack: await uploadAsset("meduza tee/meduza-tee-back.png"),
    meduzaHoodFront: await uploadAsset("meduza hoodie/meduza-hood-front.png"),
    meduzaHoodBack: await uploadAsset("meduza hoodie/meduza-hood-back.png"),
    trainerShortsFront: await uploadAsset(
      "training shorts/trainer-shorts-front-blank.png",
    ),
    trainerShortsBack: await uploadAsset(
      "training shorts/trainer-shorts-back-blank.png",
    ),
    h2bcBeanieFront: await uploadAsset("h2bc beanie/h2bc-beanie-front.png"),
    studdedBeltFront: await uploadAsset("studded belt/studded-belt-front.png"),
  };

  logger.info("Products");
  const products = [
    {
      title: "STUDDED PU$$Y BELT",
      handle: "cat-studded-belt",
      category_ids: [belts],
      shipping_profile_id: shippingProfile.id,
      status: ProductStatus.PUBLISHED,
      images: [{ url: assetUrls.studdedBeltFront }],
      options: [{ title: "Size", values: ["ONESIZE"] }],
      variants: [
        {
          title: "ONESIZE",
          sku: "cat-studded-belt",
          options: { Size: "ONESIZE" },
          prices: [
            { amount: 80, currency_code: "eur" },
            { amount: 95, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    {
      title: "TRAINER SHORTS",
      handle: "trainer-shorts",
      category_ids: [pod],
      shipping_profile_id: shippingProfile.id,
      status: ProductStatus.PUBLISHED,
      images: [
        { url: assetUrls.trainerShortsFront },
        { url: assetUrls.trainerShortsBack },
      ],
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map((s, index) => ({
        title: s,
        sku: `trainer-shorts-${s.toLowerCase()}`,
        options: { Size: s },
        variant_rank: index,
        manage_inventory: false,
        prices: [
          { amount: 45, currency_code: "eur" },
          { amount: 55, currency_code: "usd" },
        ],
      })),
      sales_channels: [{ id: salesChannel.id }],
    },
    {
      title: "H2BC BEANIE",
      handle: "h2bc-beanie",
      category_ids: [beanies],
      shipping_profile_id: shippingProfile.id,
      status: ProductStatus.PUBLISHED,
      images: [{ url: assetUrls.h2bcBeanieFront }],
      options: [{ title: "Size", values: ["ONESIZE"] }],
      variants: [
        {
          title: "ONESIZE",
          sku: "h2bc-beanie",
          options: { Size: "ONESIZE" },
          prices: [
            { amount: 25, currency_code: "eur" },
            { amount: 30, currency_code: "usd" },
          ],
        },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    {
      title: "MEDUZA HOOD",
      handle: "meduza-hood",
      category_ids: [pod],
      shipping_profile_id: shippingProfile.id,
      status: ProductStatus.PUBLISHED,
      images: [
        { url: assetUrls.meduzaHoodFront },
        { url: assetUrls.meduzaHoodBack },
      ],
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map((s, index) => ({
        title: s,
        sku: `meduza-hood-${s.toLowerCase()}`,
        options: { Size: s },
        variant_rank: index,
        manage_inventory: false,
        prices: [
          { amount: 60, currency_code: "eur" },
          { amount: 70, currency_code: "usd" },
        ],
      })),
      sales_channels: [{ id: salesChannel.id }],
    },
    {
      title: "MEDUZA TEE",
      handle: "meduza-tee",
      category_ids: [pod],
      shipping_profile_id: shippingProfile.id,
      status: ProductStatus.PUBLISHED,
      images: [
        { url: assetUrls.meduzaTeeFront },
        { url: assetUrls.meduzaTeeBack },
      ],
      options: [{ title: "Size", values: ["S", "M", "L", "XL"] }],
      variants: ["S", "M", "L", "XL"].map((s, index) => ({
        title: s,
        sku: `meduza-tee-${s.toLowerCase()}`,
        options: { Size: s },
        variant_rank: index,
        manage_inventory: false,
        prices: [
          { amount: 25, currency_code: "eur" },
          { amount: 30, currency_code: "usd" },
        ],
      })),
      sales_channels: [{ id: salesChannel.id }],
    },
  ];

  for (const product of products) {
    await createProductsWorkflow(container).run({
      input: { products: [product] },
    });
  }

  logger.info("Inventory");
  const inventoryBySku: Record<string, number> = {
    "h2bc-beanie": 10,
    "cat-studded-belt": 10,
  };

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems.flatMap(
    (i) =>
      i.sku && inventoryBySku[i.sku] !== undefined
        ? [
            {
              location_id: stockLocation.id,
              inventory_item_id: i.id,
              stocked_quantity: inventoryBySku[i.sku],
            },
          ]
        : [],
  );

  await createInventoryLevelsWorkflow(container).run({
    input: { inventory_levels: inventoryLevels },
  });
}
