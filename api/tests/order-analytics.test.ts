import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import { getOrderEvent } from "../src/workflows/track-order-event";
import { trackOrderPlaced, trackOrderRefund } from "./support/analytics";
import {
  PERSONAL_FIELDS,
  REFUND,
  TRACKED_ORDER,
  UNCONSENTED_ORDER,
} from "./support/data";
import {
  createOrder,
  listCustomerEmails,
  placeOrder,
} from "./support/notifications";

jest.setTimeout(60 * 1000);

describe("order event", () => {
  it("belongs to the shopper when they accepted analytics", () => {
    const order = TRACKED_ORDER;

    const event = getOrderEvent(order, "order_placed");

    expect(event.actor_id).toEqual("buyer@example.com");
    expect(event.properties).toMatchObject({
      name: "Jonas Jonaitis",
      total: 59.9,
      currency: "eur",
      country: "lt",
    });
    expect(event.properties?.items).toHaveLength(2);
  });

  it("names nobody when the shopper did not accept analytics", () => {
    const order = UNCONSENTED_ORDER;

    const event = getOrderEvent(order, "order_placed");

    expect(event.actor_id).toEqual(order.id);
    expect(event.properties?.$process_person_profile).toBe(false);
    expect(event.properties?.total).toEqual(59.9);
    PERSONAL_FIELDS.forEach((field) =>
      expect(event.properties).not.toHaveProperty(field),
    );
  });

  it("carries the refunded amount on a refund", () => {
    const order = TRACKED_ORDER;

    const event = getOrderEvent(order, "payment_refunded", REFUND);

    expect(event.event).toEqual("payment_refunded");
    expect(event.properties?.refunded_amount).toEqual(24.95);
  });
});

medusaIntegrationTestRunner({
  inApp: true,
  env: {},
  testSuite: ({ getContainer }) => {
    describe("order analytics without a key", () => {
      it("places the order and records its confirmation email", async () => {
        const order = await createOrder(getContainer());

        await placeOrder(getContainer(), order.id);
        const { result } = await trackOrderPlaced(getContainer(), order.id);
        const emails = await listCustomerEmails(getContainer());

        expect(result.tracked).toBe(true);
        expect(emails).toHaveLength(1);
      });

      it("finds the order behind a refunded payment", async () => {
        const order = await createOrder(getContainer());

        const { result } = await trackOrderRefund(getContainer(), order, 24.95);

        expect(result.tracked).toBe(true);
      });

      it("keeps the order when the event cannot be sent", async () => {
        const order = await createOrder(getContainer());

        await placeOrder(getContainer(), order.id);
        const { result } = await trackOrderPlaced(getContainer(), "order_none");
        const emails = await listCustomerEmails(getContainer());

        expect(result.tracked).toBe(false);
        expect(emails).toHaveLength(1);
      });
    });
  },
});
