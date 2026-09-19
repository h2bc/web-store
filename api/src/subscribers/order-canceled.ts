import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendCancellationNoticeWorkflow } from "../workflows/send-cancellation-notice";

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendCancellationNoticeWorkflow(container).run({
    input: { id: data.id },
  });
}

export const config: SubscriberConfig = {
  event: "order.canceled",
};
