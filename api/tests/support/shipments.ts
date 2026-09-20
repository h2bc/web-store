import { MedusaContainer, OrderDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createOrderFulfillmentWorkflow,
  createOrderShipmentWorkflow,
  markOrderFulfillmentAsDeliveredWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows";
import { createOrder, ORDER } from "./notifications";

export const TRACKING = {
  tracking_number: "LT123456789",
  tracking_url: "https://tracking.example.com/LT123456789",
  label_url: "",
};

const MANUAL_PROVIDER = "manual_manual";

async function createShippingOption(container: MedusaContainer) {
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const {
    result: [location],
  } = await createStockLocationsWorkflow(container).run({
    input: { locations: [{ name: "Test warehouse" }] },
  });
  const {
    result: [profile],
  } = await createShippingProfilesWorkflow(container).run({
    input: { data: [{ name: "Test shipping profile", type: "default" }] },
  });
  const [fulfillmentSet] = await container
    .resolve(Modules.FULFILLMENT)
    .createFulfillmentSets([
      {
        name: "Test shipping",
        type: "shipping",
        service_zones: [
          {
            name: "Lithuania",
            geo_zones: [{ type: "country", country_code: "lt" }],
          },
        ],
      },
    ]);

  await link.create([
    {
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: MANUAL_PROVIDER },
    },
    {
      [Modules.STOCK_LOCATION]: { stock_location_id: location.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    },
  ]);

  const {
    result: [option],
  } = await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: ORDER.shipping_methods[0].name,
        price_type: "flat",
        provider_id: MANUAL_PROVIDER,
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: profile.id,
        type: { label: "Standard", description: "2-3 days", code: "standard" },
        prices: [{ currency_code: "eur", amount: 0 }],
      },
    ],
  });

  return option;
}

export async function createShippableOrder(
  container: MedusaContainer,
  overrides: { email?: string } = {},
) {
  const option = await createShippingOption(container);

  return createOrder(container, {
    ...overrides,
    shipping_methods: [
      { ...ORDER.shipping_methods[0], shipping_option_id: option.id },
    ],
  });
}

const getOrderItems = (order: OrderDTO) =>
  (order.items ?? []).map((item) => ({ id: item.id, quantity: item.quantity }));

type NotifyOptions = { no_notification?: boolean };

export async function fulfillOrder(
  container: MedusaContainer,
  order: OrderDTO,
  options: NotifyOptions = {},
) {
  const { result: fulfillment } = await createOrderFulfillmentWorkflow(
    container,
  ).run({
    input: {
      order_id: order.id,
      items: getOrderItems(order),
      no_notification: options.no_notification ?? false,
    },
  });

  return fulfillment;
}

export async function shipOrder(
  container: MedusaContainer,
  order: OrderDTO,
  options: NotifyOptions & { labels?: (typeof TRACKING)[] } = {},
) {
  const fulfillment = await fulfillOrder(container, order);

  await createOrderShipmentWorkflow(container).run({
    input: {
      order_id: order.id,
      fulfillment_id: fulfillment.id,
      items: getOrderItems(order),
      labels: options.labels ?? [],
      no_notification: options.no_notification ?? false,
    },
  });

  return fulfillment;
}

export async function deliverOrder(
  container: MedusaContainer,
  order: OrderDTO,
  options: NotifyOptions = {},
) {
  const fulfillment = await fulfillOrder(container, order, {
    no_notification: true,
  });

  await markOrderFulfillmentAsDeliveredWorkflow(container).run({
    input: {
      orderId: order.id,
      fulfillmentId: fulfillment.id,
      no_notification: options.no_notification ?? false,
    },
  });

  return fulfillment;
}
