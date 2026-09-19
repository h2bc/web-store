import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  when,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { CreateNotificationDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  sendNotificationsStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows";
import { dashboardUrl } from "../utils/dashboard-url";

type SendOrderConfirmationInput = {
  id: string;
};

type OrderForEmail = {
  id: string;
  email: string | null;
};

type Recipients = {
  inbox: string | null;
  adminUrl: string | null;
};

const warnOrderWithoutEmailStep = createStep(
  "warn-order-without-email",
  async ({ id }: SendOrderConfirmationInput, { container }) => {
    container
      .resolve(ContainerRegistrationKeys.LOGGER)
      .warn(`Order ${id} has no email, skipping the confirmation email`);
  },
);

const getNotificationRecipientsStep = createStep(
  "get-notification-recipients",
  async ({ id }: SendOrderConfirmationInput, { container }) => {
    const inbox = process.env.ORDER_INBOX_EMAIL || null;
    const adminUrl = inbox ? dashboardUrl(container, `/orders/${id}`) : null;

    return new StepResponse<Recipients>({ inbox, adminUrl });
  },
);

const getCustomerNotification = (
  order: OrderForEmail,
): CreateNotificationDTO[] =>
  order.email
    ? [
        {
          to: order.email,
          channel: "email",
          template: "order-placed",
          data: { order },
          idempotency_key: `order-placed-${order.id}`,
        },
      ]
    : [];

const getOwnerNotification = (
  order: OrderForEmail,
  { inbox, adminUrl }: Recipients,
): CreateNotificationDTO[] =>
  inbox
    ? [
        {
          to: inbox,
          channel: "email",
          template: "order-placed-owner",
          data: { order, admin_url: adminUrl },
          idempotency_key: `order-placed-owner-${order.id}`,
        },
      ]
    : [];

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
    const recipients = getNotificationRecipientsStep({ id });

    const order: WorkflowData<OrderForEmail> = transform(
      { orders },
      ({ orders }) => orders[0],
    );

    when({ order }, ({ order }) => !order.email).then(() =>
      warnOrderWithoutEmailStep({ id }),
    );

    const notifications = transform(
      { order, recipients },
      ({ order, recipients }) => [
        ...getCustomerNotification(order),
        ...getOwnerNotification(order, recipients),
      ],
    );

    return new WorkflowResponse(sendNotificationsStep(notifications));
  },
);
