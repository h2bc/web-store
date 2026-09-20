import {
  createStep,
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  sendNotificationsStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import {
  FulfillmentItem,
  getFulfilledItems,
  OrderLine,
} from "../utils/fulfilled-items";

type SendShipmentNoticeInput = {
  id: string;
  no_notification?: boolean;
};

type ShippedFulfillment = {
  id: string;
  items: FulfillmentItem[];
  labels: unknown[];
  order: {
    id: string;
    display_id: number;
    email: string | null;
    shipping_address: unknown;
    items?: OrderLine[];
  } | null;
};

const warnShipmentWithoutEmailStep = createStep(
  "warn-shipment-without-email",
  async ({ id }: { id: string }, { container }) => {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(
        `Fulfillment ${id} belongs to an order without email, skipping the shipped email`,
      );
  },
);

export const sendShipmentNoticeWorkflow = createWorkflow(
  "send-shipment-notice",
  (input: SendShipmentNoticeInput) => {
    const fulfillment = when(
      input,
      ({ no_notification }) => !no_notification,
    ).then(() => {
      const { data: fulfillments } = useQueryGraphStep({
        entity: "fulfillment",
        fields: [
          "id",
          "labels.*",
          "items.*",
          "order.id",
          "order.display_id",
          "order.email",
          "order.shipping_address.*",
          "order.items.*",
        ],
        filters: { id: input.id },
        options: { throwIfKeyNotFound: true },
      });

      const shipped: WorkflowData<ShippedFulfillment> = transform(
        { fulfillments },
        ({ fulfillments }) => fulfillments[0] as unknown as ShippedFulfillment,
      );

      return shipped;
    });

    when(
      { fulfillment },
      ({ fulfillment }) => !!fulfillment && !fulfillment.order?.email,
    ).then(() => warnShipmentWithoutEmailStep({ id: input.id }));

    const notifications = when(
      { fulfillment },
      ({ fulfillment }) => !!fulfillment?.order?.email,
    ).then(() => {
      const notification = transform({ fulfillment }, ({ fulfillment }) => [
        {
          to: fulfillment!.order!.email!,
          channel: "email",
          template: "order-shipped",
          data: {
            order: fulfillment!.order,
            items: getFulfilledItems(
              fulfillment!.items,
              fulfillment!.order?.items,
            ),
            tracking: fulfillment!.labels,
          },
          idempotency_key: `order-shipped-${fulfillment!.id}`,
        },
      ]);

      return sendNotificationsStep(notification);
    });

    return new WorkflowResponse({ notifications });
  },
);
