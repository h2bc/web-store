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

type SendDeliveryNoticeInput = {
  id: string;
  no_notification?: boolean;
};

type DeliveredFulfillment = {
  id: string;
  items: FulfillmentItem[];
  order: {
    id: string;
    display_id: number;
    email: string | null;
    shipping_address: unknown;
    items?: OrderLine[];
  } | null;
};

const warnDeliveryWithoutEmailStep = createStep(
  "warn-delivery-without-email",
  async ({ id }: { id: string }, { container }) => {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(
        `Fulfillment ${id} belongs to an order without email, skipping the delivered email`,
      );
  },
);

export const sendDeliveryNoticeWorkflow = createWorkflow(
  "send-delivery-notice",
  (input: SendDeliveryNoticeInput) => {
    const fulfillment = when(
      input,
      ({ no_notification }) => !no_notification,
    ).then(() => {
      const { data: fulfillments } = useQueryGraphStep({
        entity: "fulfillment",
        fields: [
          "id",
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

      const loaded: WorkflowData<DeliveredFulfillment> = transform(
        { fulfillments },
        ({ fulfillments }) =>
          fulfillments[0] as unknown as DeliveredFulfillment,
      );

      return loaded;
    });

    when(
      { fulfillment },
      ({ fulfillment }) => !!fulfillment && !fulfillment.order?.email,
    ).then(() => warnDeliveryWithoutEmailStep({ id: input.id }));

    const notifications = when(
      { fulfillment },
      ({ fulfillment }) => !!fulfillment?.order?.email,
    ).then(() => {
      const notification = transform({ fulfillment }, ({ fulfillment }) => [
        {
          to: fulfillment!.order!.email!,
          channel: "email",
          template: "order-delivered",
          data: {
            order: fulfillment!.order,
            items: getFulfilledItems(
              fulfillment!.items,
              fulfillment!.order?.items,
            ),
          },
          idempotency_key: `order-delivered-${fulfillment!.id}`,
        },
      ]);

      return sendNotificationsStep(notification);
    });

    return new WorkflowResponse({ notifications });
  },
);
