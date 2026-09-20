import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  BigNumberValue,
  TrackAnalyticsEventDTO,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils";

export type OrderEventName =
  | "order_placed"
  | "order_canceled"
  | "shipment_created"
  | "payment_captured"
  | "payment_refunded";

type TrackOrderEventInput = {
  event: OrderEventName;
  order_id?: string;
  fulfillment_id?: string;
  payment_id?: string;
};

type TrackedOrder = {
  id: string;
  display_id?: number | null;
  email?: string | null;
  currency_code: string;
  total?: BigNumberValue | null;
  metadata?: Record<string, unknown> | null;
  shipping_address?: {
    first_name?: string | null;
    last_name?: string | null;
    country_code?: string | null;
  } | null;
  items?:
    | {
        product_id?: string | null;
        variant_id?: string | null;
        product_title?: string | null;
        variant_title?: string | null;
        quantity: BigNumberValue;
        unit_price: BigNumberValue;
      }[]
    | null;
};

type TrackedPayment = {
  amount?: BigNumberValue | null;
  refunds?: { amount: BigNumberValue; created_at: string | Date }[] | null;
  payment_collection?: { order?: { id: string } | null } | null;
};

const ORDER_FIELDS = [
  "id",
  "display_id",
  "email",
  "currency_code",
  "total",
  "metadata",
  "shipping_address.first_name",
  "shipping_address.last_name",
  "shipping_address.country_code",
  "items.product_id",
  "items.variant_id",
  "items.product_title",
  "items.variant_title",
  "items.quantity",
  "items.unit_price",
];

const getOrderProperties = (order: TrackedOrder) => ({
  order_id: order.id,
  display_id: order.display_id,
  total: order.total,
  currency: order.currency_code,
  country: order.shipping_address?.country_code,
  items: (order.items ?? []).map((item) => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
    product: item.product_title,
    variant: item.variant_title,
    quantity: item.quantity,
    price: item.unit_price,
  })),
});

const getShopperName = (order: TrackedOrder) =>
  [order.shipping_address?.first_name, order.shipping_address?.last_name]
    .filter(Boolean)
    .join(" ");

export const getOrderEvent = (
  order: TrackedOrder,
  event: OrderEventName,
  extra: Record<string, unknown> = {},
): TrackAnalyticsEventDTO => {
  const properties = { ...getOrderProperties(order), ...extra };
  const hasConsent = order.metadata?.analytics_consent === true && order.email;

  if (!hasConsent) {
    return {
      event,
      actor_id: order.id,
      properties: { ...properties, $process_person_profile: false },
    };
  }

  const email = order.email!.trim().toLowerCase();
  const name = getShopperName(order);

  return {
    event,
    actor_id: email,
    properties: { ...properties, email, name, $set: { email, name } },
  };
};

const getLastRefundAmount = (payment: TrackedPayment) =>
  [...(payment.refunds ?? [])].sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  )[0]?.amount;

const getPaymentProperties = (
  event: OrderEventName,
  payment: TrackedPayment,
) =>
  event === "payment_refunded"
    ? { refunded_amount: getLastRefundAmount(payment) }
    : { amount: payment.amount };

const trackOrderEventStep = createStep(
  "track-order-event",
  async (input: TrackOrderEventInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    const getPayment = async (): Promise<TrackedPayment | undefined> => {
      const { data } = await query.graph({
        entity: "payment",
        fields: [
          "amount",
          "refunds.amount",
          "refunds.created_at",
          "payment_collection.order.id",
        ],
        filters: { id: input.payment_id },
      });

      return data[0] as unknown as TrackedPayment | undefined;
    };

    const getFulfillmentOrderId = async () => {
      const { data } = await query.graph({
        entity: "fulfillment",
        fields: ["order.id"],
        filters: { id: input.fulfillment_id },
      });

      return (data[0] as { order?: { id: string } } | undefined)?.order?.id;
    };

    try {
      const payment = input.payment_id ? await getPayment() : undefined;
      const orderId =
        input.order_id ??
        payment?.payment_collection?.order?.id ??
        (input.fulfillment_id ? await getFulfillmentOrderId() : undefined);

      if (!orderId) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `No order behind the ${input.event} event`,
        );
      }

      const { data: orders } = await query.graph({
        entity: "order",
        fields: ORDER_FIELDS,
        filters: { id: orderId },
      });

      if (!orders[0]) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `Order ${orderId} was not found`,
        );
      }

      const extra = payment ? getPaymentProperties(input.event, payment) : {};

      await container
        .resolve(Modules.ANALYTICS)
        .track(
          getOrderEvent(
            orders[0] as unknown as TrackedOrder,
            input.event,
            extra,
          ),
        );

      return new StepResponse({ tracked: true });
    } catch (error) {
      logger.warn(
        `Could not track ${input.event}: ${error instanceof Error ? error.message : error}`,
      );

      return new StepResponse({ tracked: false });
    }
  },
);

export const trackOrderEventWorkflow = createWorkflow(
  "track-order-event",
  (input: TrackOrderEventInput) =>
    new WorkflowResponse(trackOrderEventStep(input)),
);
