import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendDeliveryNoticeWorkflow } from "../workflows/send-delivery-notice";

export default async function deliveryCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  await sendDeliveryNoticeWorkflow(container).run({
    input: { id: data.id, no_notification: data.no_notification },
  });
}

export const config: SubscriberConfig = {
  event: "delivery.created",
};
