import { MedusaContainer, OrderDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { sendCancellationNoticeWorkflow } from "../../src/workflows/send-cancellation-notice";
import { listNotifications } from "./notifications";

const SYSTEM_PROVIDER = "pp_system_default";

export async function refundOrderPayment(
  container: MedusaContainer,
  order: OrderDTO,
  amount: number,
) {
  const payments = container.resolve(Modules.PAYMENT);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const [collection] = await payments.createPaymentCollections([
    { currency_code: order.currency_code, amount },
  ]);
  const session = await payments.createPaymentSession(collection.id, {
    provider_id: SYSTEM_PROVIDER,
    currency_code: order.currency_code,
    amount,
    data: {},
  });
  const payment = await payments.authorizePaymentSession(session.id, {});

  if (!payment) {
    throw new Error("The system payment provider authorized no payment");
  }

  await payments.capturePayment({ payment_id: payment.id });
  await payments.refundPayment({ payment_id: payment.id });
  await link.create({
    [Modules.ORDER]: { order_id: order.id },
    [Modules.PAYMENT]: { payment_collection_id: collection.id },
  });
}

export async function cancelOrder(container: MedusaContainer, id: string) {
  return sendCancellationNoticeWorkflow(container).run({ input: { id } });
}

export function listCancelledEmails(container: MedusaContainer) {
  return listNotifications(container, {
    template: "order-canceled",
    channel: "email",
  });
}
