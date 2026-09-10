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

type SendOrderConfirmationInput = {
  id: string;
};

type OrderForEmail = {
  id: string;
  email: string | null;
};

const warnOrderWithoutEmailStep = createStep(
  "warn-order-without-email",
  async ({ id }: SendOrderConfirmationInput, { container }) => {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(`Order ${id} has no email, skipping the confirmation email`);
  },
);

export const sendOrderConfirmationWorkflow = createWorkflow(
  "send-order-confirmation",
  ({ id }: SendOrderConfirmationInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "item_total",
        "tax_total",
        "items.*",
        "shipping_methods.*",
        "shipping_address.*",
        "customer.*",
      ],
      filters: { id },
      options: { throwIfKeyNotFound: true },
    });

    const order: WorkflowData<OrderForEmail> = transform(
      { orders },
      ({ orders }) => orders[0],
    );

    when({ order }, ({ order }) => !order.email).then(() =>
      warnOrderWithoutEmailStep({ id }),
    );

    const notifications = when({ order }, ({ order }) => !!order.email).then(
      () => {
        const input = transform({ order }, ({ order }) => [
          {
            to: order.email!,
            channel: "email",
            template: "order-placed",
            data: { order },
            idempotency_key: `order-placed-${order.id}`,
          },
        ]);
        return sendNotificationsStep(input);
      },
    );

    return new WorkflowResponse({ notifications });
  },
);
