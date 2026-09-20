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

type SendOrderEditNoticeInput = {
  order_id: string;
  action_id?: string;
  no_notification?: boolean;
};

type EditedOrder = {
  id: string;
  email: string | null;
};

const warnOrderEditSkippedStep = createStep(
  "warn-order-edit-skipped",
  async ({ id, reason }: { id: string; reason: string }, { container }) => {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(`Order ${id} ${reason}, skipping the order edited email`);
  },
);

export const sendOrderEditNoticeWorkflow = createWorkflow(
  "send-order-edit-notice",
  (input: SendOrderEditNoticeInput) => {
    when(
      input,
      ({ no_notification, action_id }) => !no_notification && !action_id,
    ).then(() =>
      warnOrderEditSkippedStep({
        id: input.order_id,
        reason: "was edited with no actions",
      }).config({ name: "warn-order-edit-without-actions" }),
    );

    const order = when(
      input,
      ({ no_notification, action_id }) => !no_notification && !!action_id,
    ).then(() => {
      const { data: orders } = useQueryGraphStep({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "email",
          "currency_code",
          "total",
          "items.*",
        ],
        filters: { id: input.order_id },
        options: { throwIfKeyNotFound: true },
      });

      const edited: WorkflowData<EditedOrder> = transform(
        { orders },
        ({ orders }) => orders[0] as unknown as EditedOrder,
      );

      return edited;
    });

    when({ order }, ({ order }) => !!order && !order.email).then(() =>
      warnOrderEditSkippedStep({ id: input.order_id, reason: "has no email" }),
    );

    const notifications = when({ order }, ({ order }) => !!order?.email).then(
      () => {
        const notification = transform({ order, input }, ({ order, input }) => [
          {
            to: order!.email!,
            channel: "email",
            template: "order-edited",
            data: { order },
            idempotency_key: `order-edited-${input.action_id}`,
          },
        ]);

        return sendNotificationsStep(notification);
      },
    );

    return new WorkflowResponse({ notifications });
  },
);
