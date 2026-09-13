import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createDefaultsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function seedStore({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const fulfillment = container.resolve(Modules.FULFILLMENT);
  const payment = container.resolve(Modules.PAYMENT);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);
  const storeService = container.resolve(Modules.STORE);

  const restOfEurope = [
    "at",
    "be",
    "bg",
    "hr",
    "cy",
    "cz",
    "dk",
    "ee",
    "fi",
    "fr",
    "de",
    "gr",
    "hu",
    "ie",
    "it",
    "lv",
    "lu",
    "mt",
    "nl",
    "pl",
    "pt",
    "ro",
    "sk",
    "si",
    "es",
    "se",
  ];

  logger.info("Store + Sales Channel");
  await createDefaultsWorkflow(container).run();
  const [store] = await storeService.listStores();

  if (!store) throw new Error("No store exists");

  const [salesChannel] = await salesChannelService.listSalesChannels({});

  if (!salesChannel) throw new Error("No sales channel exists");

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "eur", is_default: true },
          { currency_code: "usd" },
        ],
        default_sales_channel_id: salesChannel.id,
      },
    },
  });

  logger.info("Regions");
  const paymentProviderIds = (
    await payment.listPaymentProviders({ is_enabled: true })
  )
    .map((provider) => provider.id)
    .filter((id) => !id.startsWith("pp_stripe-"));

  const {
    result: [region],
  } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries: ["lt", ...restOfEurope],
          payment_providers: paymentProviderIds,
          is_tax_inclusive: true,
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_region_id: region.id },
    },
  });

  logger.info("Stock location");
  const { result: locations } = await createStockLocationsWorkflow(
    container,
  ).run({
    input: {
      locations: [
        {
          name: "h2bc hq",
          address: {
            address_1: "M. Vyganto",
            address_2: "12",
            city: "Vilnius",
            postal_code: "01234",
            country_code: "LT",
          },
        },
      ],
    },
  });

  const stockLocation = locations[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  logger.info("Shipping");
  const shippingProfile =
    (await fulfillment.listShippingProfiles({ type: "default" }))[0] ??
    (
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Default Shipping Profile", type: "default" }],
        },
      })
    ).result[0];

  const [fulfillmentSet] = await fulfillment.createFulfillmentSets([
    {
      name: "h2bc shipping",
      type: "shipping",
      service_zones: [
        {
          name: "Lithuania",
          geo_zones: [
            {
              type: "country" as const,
              country_code: "lt",
            },
          ],
        },
        {
          name: "Rest of Europe",
          geo_zones: restOfEurope.map((c) => ({
            type: "country" as const,
            country_code: c,
          })),
        },
      ],
    },
  ]);

  const ltServiceZone = fulfillmentSet.service_zones.find(
    (zone) => zone.name === "Lithuania",
  );
  const euServiceZone = fulfillmentSet.service_zones.find(
    (zone) => zone.name === "Rest of Europe",
  );

  if (!ltServiceZone || !euServiceZone) {
    throw new Error("Failed to create shipping service zones");
  }

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping LT",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: ltServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "2–3 days",
          code: "standard-lt",
        },
        prices: [
          { currency_code: "eur", amount: 2.99 },
          {
            currency_code: "eur",
            amount: 0,
            rules: [{ attribute: "item_total", operator: "gte", value: 30 }],
          },
        ],
        rules: [
          { attribute: "enabled_in_store", operator: "eq", value: "true" },
          { attribute: "is_return", operator: "eq", value: "false" },
        ],
      },
      {
        name: "Standard Shipping EU",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: euServiceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "2–3 days",
          code: "standard-eu",
        },
        prices: [
          { currency_code: "eur", amount: 5.99 },
          {
            currency_code: "eur",
            amount: 0,
            rules: [{ attribute: "item_total", operator: "gte", value: 60 }],
          },
        ],
        rules: [
          { attribute: "enabled_in_store", operator: "eq", value: "true" },
          { attribute: "is_return", operator: "eq", value: "false" },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [salesChannel.id] },
  });

  logger.info("Publishable API key");
  const { data: publishableApiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "type"],
    filters: { type: "publishable" },
  });

  const publishableApiKey = publishableApiKeys[0];

  if (!publishableApiKey) {
    throw new Error(
      "No publishable API key found to link to the sales channel",
    );
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [salesChannel.id] },
  });
}
