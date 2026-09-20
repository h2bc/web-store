import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendFulfillmentNoticeWorkflow } from "../workflows/send-fulfillment-notice";

export default async function fulfillmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ fulfillment_id: string; no_notification?: boolean }>) {
  await sendFulfillmentNoticeWorkflow(container).run({
    input: { id: data.fulfillment_id, no_notification: data.no_notification },
  });
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
};
