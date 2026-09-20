import { MedusaContainer, OrderDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { trackOrderEventWorkflow } from "../../src/workflows/track-order-event";
import { refundOrderPayment } from "./cancellations";

export async function trackOrderPlaced(
  container: MedusaContainer,
  orderId: string,
) {
  return trackOrderEventWorkflow(container).run({
    input: { event: "order_placed", order_id: orderId },
  });
}

export async function trackOrderRefund(
  container: MedusaContainer,
  order: OrderDTO,
  amount: number,
) {
  await refundOrderPayment(container, order, amount);

  const { data } = await container
    .resolve(ContainerRegistrationKeys.QUERY)
    .graph({
      entity: "order",
      fields: ["payment_collections.payments.id"],
      filters: { id: order.id },
    });
  const paymentId = data[0]?.payment_collections?.[0]?.payments?.[0]?.id;

  if (!paymentId) {
    throw new Error(`Order ${order.id} has no payment to track`);
  }

  return trackOrderEventWorkflow(container).run({
    input: { event: "payment_refunded", payment_id: paymentId },
  });
}
