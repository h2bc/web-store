import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { sendShipmentNoticeWorkflow } from "../workflows/send-shipment-notice";

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  await sendShipmentNoticeWorkflow(container).run({
    input: { id: data.id, no_notification: data.no_notification },
  });
}

export const config: SubscriberConfig = {
  event: "shipment.created",
};
