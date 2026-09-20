import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderEditNoticeWorkflow } from "../workflows/send-order-edit-notice";

type OrderEditConfirmed = {
  order_id: string;
  actions?: { id: string }[];
  no_notification?: boolean;
};

export default async function orderEditConfirmedHandler({
  event: { data },
  container,
}: SubscriberArgs<OrderEditConfirmed>) {
  await sendOrderEditNoticeWorkflow(container).run({
    input: {
      order_id: data.order_id,
      action_id: data.actions?.[0]?.id,
      no_notification: data.no_notification,
    },
  });
}

export const config: SubscriberConfig = {
  event: "order-edit.confirmed",
};
