import {
  createStep,
  createWorkflow,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { BigNumberValue } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, MathBN } from "@medusajs/framework/utils";
import {
  sendNotificationsStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";

type SendCancellationNoticeInput = {
  id: string;
};

type CanceledOrder = {
  id: string;
  email: string | null;
  payment_collections?: { refunded_amount?: BigNumberValue | null }[];
};

const warnCancellationWithoutEmailStep = createStep(
  "warn-cancellation-without-email",
  async ({ id }: SendCancellationNoticeInput, { container }) => {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(`Order ${id} has no email, skipping the cancelled email`);
  },
);

const getRefundedTotal = (order: CanceledOrder) =>
  MathBN.sum(
    ...(order.payment_collections ?? []).map(
      (collection) => collection.refunded_amount ?? 0,
    ),
  ).toNumber();

export const sendCancellationNoticeWorkflow = createWorkflow(
  "send-cancellation-notice",
  ({ id }: SendCancellationNoticeInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "items.*",
        "payment_collections.refunded_amount",
      ],
      filters: { id },
      options: { throwIfKeyNotFound: true },
    });

    const order: WorkflowData<CanceledOrder> = transform(
      { orders },
      ({ orders }) => orders[0] as unknown as CanceledOrder,
    );

    when({ order }, ({ order }) => !order.email).then(() =>
      warnCancellationWithoutEmailStep({ id }),
    );

    const notifications = when({ order }, ({ order }) => !!order.email).then(
      () => {
        const notification = transform({ order }, ({ order }) => [
          {
            to: order.email!,
            channel: "email",
            template: "order-canceled",
            data: { order, refunded_total: getRefundedTotal(order) },
            idempotency_key: `order-canceled-${order.id}`,
          },
        ]);

        return sendNotificationsStep(notification);
      },
    );

    return new WorkflowResponse({ notifications });
  },
);
