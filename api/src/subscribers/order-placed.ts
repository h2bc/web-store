import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendOrderConfirmationWorkflow } from "../workflows/send-order-confirmation";
import { trackOrderEventWorkflow } from "../workflows/track-order-event";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendOrderConfirmationWorkflow(container).run({
    input: { id: data.id },
  });
  await trackOrderEventWorkflow(container).run({
    input: { event: "order_placed", order_id: data.id },
  });
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
