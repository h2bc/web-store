import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  BACKEND_URL,
  createOrder,
  createPlacedOrder,
  listCustomerEmails,
  listOwnerEmails,
  ORDER_INBOX,
  placeOrder,
  spyOnLogger,
  withoutEnv,
} from "./support/notifications";
import {
  cancelOrder,
  listCancelledEmails,
  refundOrderPayment,
} from "./support/cancellations";
import {
  createShippableOrder,
  listShippedEmailsAfterSettling,
  redeliverShipmentEvent,
  shipOrder,
  TRACKING,
  waitForShippedEmails,
} from "./support/shipments";

jest.setTimeout(60 * 1000);

medusaIntegrationTestRunner({
  inApp: true,
  env: {
    ORDER_INBOX_EMAIL: ORDER_INBOX,
    MEDUSA_BACKEND_URL: BACKEND_URL,
  },
  testSuite: ({ getContainer }) => {
    describe("owner email on order placed", () => {
      it("emails the order inbox with a link to the order in the admin", async () => {
        const order = await createOrder(getContainer());

        await placeOrder(getContainer(), order.id);
        const emails = await listOwnerEmails(getContainer());

        expect(emails).toHaveLength(1);
        expect(emails[0].to).toEqual(ORDER_INBOX);
        expect(emails[0].data?.admin_url).toEqual(
          `${BACKEND_URL}/app/orders/${order.id}`,
        );
        expect(emails[0].data?.order).toMatchObject({
          display_id: order.display_id,
        });
      });

      it("does not email the inbox twice when the placed event is delivered again", async () => {
        const order = await createPlacedOrder(getContainer());

        await placeOrder(getContainer(), order.id);
        const emails = await listOwnerEmails(getContainer());

        expect(emails).toHaveLength(1);
      });

      it("records no owner email when the inbox is not set", async () => {
        const order = await createOrder(getContainer());

        await withoutEnv("ORDER_INBOX_EMAIL", () =>
          placeOrder(getContainer(), order.id),
        );
        const ownerEmails = await listOwnerEmails(getContainer());
        const customerEmails = await listCustomerEmails(getContainer());

        expect(ownerEmails).toHaveLength(0);
        expect(customerEmails).toHaveLength(1);
      });
    });

    describe("customer email on cancellation", () => {
      it("emails the shopper the refunded amount when a paid order is cancelled", async () => {
        const order = await createOrder(getContainer());

        await refundOrderPayment(getContainer(), order, 59.9);

        await cancelOrder(getContainer(), order.id);
        const emails = await listCancelledEmails(getContainer());

        expect(emails).toHaveLength(1);
        expect(emails[0].to).toEqual(order.email);
        expect(emails[0].data?.refunded_total).toEqual(59.9);
        expect(emails[0].data?.order).toMatchObject({
          display_id: order.display_id,
        });
      });

      it("emails the shopper with nothing refunded when no payment was captured", async () => {
        const order = await createOrder(getContainer());

        await cancelOrder(getContainer(), order.id);
        const emails = await listCancelledEmails(getContainer());

        expect(emails).toHaveLength(1);
        expect(emails[0].data?.refunded_total).toEqual(0);
      });

      it("warns and sends nothing when the cancelled order has no email", async () => {
        const order = await createOrder(getContainer(), { email: undefined });
        const logger = spyOnLogger(getContainer());

        await cancelOrder(getContainer(), order.id);
        const emails = await listCancelledEmails(getContainer());

        expect(emails).toHaveLength(0);
        expect(logger.warn).toHaveBeenCalled();
      });

      it("does not email the shopper twice when the cancelled event is delivered again", async () => {
        const order = await createOrder(getContainer());

        await cancelOrder(getContainer(), order.id);

        await cancelOrder(getContainer(), order.id);
        const emails = await listCancelledEmails(getContainer());

        expect(emails).toHaveLength(1);
      });
    });

    describe("customer email on shipment", () => {
      it("emails the shopper when the parcel ships with its tracking number", async () => {
        const order = await createShippableOrder(getContainer());

        await shipOrder(getContainer(), order, { labels: [TRACKING] });
        const emails = await waitForShippedEmails(getContainer(), 1);

        expect(emails).toHaveLength(1);
        expect(emails[0].to).toEqual(order.email);
        expect(emails[0].data?.order).toMatchObject({
          display_id: order.display_id,
        });
        expect(emails[0].data?.items).toHaveLength(order.items?.length ?? 0);
        expect(emails[0].data?.tracking).toEqual([
          expect.objectContaining({
            tracking_number: TRACKING.tracking_number,
            tracking_url: TRACKING.tracking_url,
          }),
        ]);
      });

      it("emails the shopper without tracking when none was entered", async () => {
        const order = await createShippableOrder(getContainer());

        await shipOrder(getContainer(), order);
        const emails = await waitForShippedEmails(getContainer(), 1);

        expect(emails).toHaveLength(1);
        expect(emails[0].data?.tracking).toEqual([]);
      });

      it("sends nothing when the owner opts out of the notification", async () => {
        const order = await createShippableOrder(getContainer());

        await shipOrder(getContainer(), order, { no_notification: true });
        const emails = await listShippedEmailsAfterSettling(getContainer());

        expect(emails).toHaveLength(0);
      });

      it("does not email the shopper twice when the shipment event is delivered again", async () => {
        const order = await createShippableOrder(getContainer());
        const fulfillment = await shipOrder(getContainer(), order);

        await waitForShippedEmails(getContainer(), 1);

        await redeliverShipmentEvent(getContainer(), fulfillment.id);
        const emails = await listShippedEmailsAfterSettling(getContainer());

        expect(emails).toHaveLength(1);
      });
    });
  },
});
