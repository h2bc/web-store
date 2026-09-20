import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { trackOrderEventWorkflow } from "../workflows/track-order-event";

export default async function paymentCapturedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await trackOrderEventWorkflow(container).run({
    input: { event: "payment_captured", payment_id: data.id },
  });
}

export const config: SubscriberConfig = {
  event: "payment.captured",
};
