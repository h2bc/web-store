import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendShipmentNoticeWorkflow } from "../workflows/send-shipment-notice";
import { trackOrderEventWorkflow } from "../workflows/track-order-event";

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  await sendShipmentNoticeWorkflow(container).run({
    input: { id: data.id, no_notification: data.no_notification },
  });
  await trackOrderEventWorkflow(container).run({
    input: { event: "shipment_created", fulfillment_id: data.id },
  });
}

export const config: SubscriberConfig = {
  event: "shipment.created",
};
