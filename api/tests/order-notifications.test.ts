import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  BACKEND_URL,
  createOrder,
  createPlacedOrder,
  listCustomerEmails,
  listEmailsAfterSettling,
  listOwnerEmails,
  ORDER_INBOX,
  placeOrder,
  redeliverEvent,
  runWithoutEnv,
  waitForEmails,
} from "./support/notifications";
import {
  cancelOrder,
  listCancelledEmails,
  refundOrderPayment,
} from "./support/cancellations";
import { confirmOrderEdit } from "./support/order-edits";
import {
  createShippableOrder,
  deliverOrder,
  fulfillOrder,
  shipOrder,
  TRACKING,
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

        await runWithoutEnv("ORDER_INBOX_EMAIL", () =>
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

      it("sends nothing when the cancelled order has no email", async () => {
        const order = await createOrder(getContainer(), { email: undefined });

        await cancelOrder(getContainer(), order.id);
        const emails = await listCancelledEmails(getContainer());

        expect(emails).toHaveLength(0);
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
        const emails = await waitForEmails(getContainer(), "order-shipped", 1);

        expect(emails).toHaveLength(1);
        expect(emails[0].to).toEqual(order.email);
        expect(emails[0].data?.order).toMatchObject({
          display_id: order.display_id,
        });
        expect(emails[0].data?.items).toHaveLength(order.items?.length ?? 0);
        expect(emails[0].data?.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ variant_title: "Black" }),
          ]),
        );
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
        const emails = await waitForEmails(getContainer(), "order-shipped", 1);

        expect(emails).toHaveLength(1);
        expect(emails[0].data?.tracking).toEqual([]);
      });

      it("sends nothing when the owner opts out of the notification", async () => {
        const order = await createShippableOrder(getContainer());

        await shipOrder(getContainer(), order, { no_notification: true });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-shipped",
        );

        expect(emails).toHaveLength(0);
      });

      it("does not email the shopper twice when the shipment event is delivered again", async () => {
        const order = await createShippableOrder(getContainer());
        const fulfillment = await shipOrder(getContainer(), order);

        await waitForEmails(getContainer(), "order-shipped", 1);

        await redeliverEvent(getContainer(), "shipment.created", {
          id: fulfillment.id,
          no_notification: false,
        });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-shipped",
        );

        expect(emails).toHaveLength(1);
      });
    });

    describe("customer email on fulfilment created", () => {
      it("emails the shopper the items being packed when the fulfilment is created", async () => {
        const order = await createShippableOrder(getContainer());

        await fulfillOrder(getContainer(), order);
        const emails = await waitForEmails(
          getContainer(),
          "order-fulfillment-created",
          1,
        );

        expect(emails).toHaveLength(1);
        expect(emails[0].to).toEqual(order.email);
        expect(emails[0].data?.order).toMatchObject({
          display_id: order.display_id,
        });
        expect(emails[0].data?.items).toHaveLength(order.items?.length ?? 0);
        expect(emails[0].data?.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ variant_title: "Black" }),
          ]),
        );
      });

      it("sends nothing when the owner opts out of the fulfilment notification", async () => {
        const order = await createShippableOrder(getContainer());

        await fulfillOrder(getContainer(), order, { no_notification: true });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-fulfillment-created",
        );

        expect(emails).toHaveLength(0);
      });

      it("sends nothing when the fulfilled order has no email", async () => {
        const order = await createShippableOrder(getContainer(), {
          email: undefined,
        });

        await fulfillOrder(getContainer(), order);
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-fulfillment-created",
        );

        expect(emails).toHaveLength(0);
      });

      it("does not email the shopper twice when the fulfilment event is delivered again", async () => {
        const order = await createShippableOrder(getContainer());
        const fulfillment = await fulfillOrder(getContainer(), order);

        await waitForEmails(getContainer(), "order-fulfillment-created", 1);

        await redeliverEvent(getContainer(), "order.fulfillment_created", {
          order_id: order.id,
          fulfillment_id: fulfillment.id,
          no_notification: false,
        });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-fulfillment-created",
        );

        expect(emails).toHaveLength(1);
      });
    });

    describe("customer email on delivery", () => {
      it("emails the shopper the delivered items when the fulfilment is marked as delivered", async () => {
        const order = await createShippableOrder(getContainer());

        await deliverOrder(getContainer(), order);
        const emails = await waitForEmails(
          getContainer(),
          "order-delivered",
          1,
        );

        expect(emails).toHaveLength(1);
        expect(emails[0].to).toEqual(order.email);
        expect(emails[0].data?.order).toMatchObject({
          display_id: order.display_id,
        });
        expect(emails[0].data?.items).toHaveLength(order.items?.length ?? 0);
        expect(emails[0].data?.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ variant_title: "Black" }),
          ]),
        );
      });

      it("sends nothing when the owner opts out of the delivery notification", async () => {
        const order = await createShippableOrder(getContainer());

        await deliverOrder(getContainer(), order, { no_notification: true });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-delivered",
        );

        expect(emails).toHaveLength(0);
      });

      it("sends nothing when the delivered order has no email", async () => {
        const order = await createShippableOrder(getContainer(), {
          email: undefined,
        });

        await deliverOrder(getContainer(), order);
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-delivered",
        );

        expect(emails).toHaveLength(0);
      });

      it("does not email the shopper twice when the delivery event is delivered again", async () => {
        const order = await createShippableOrder(getContainer());
        const fulfillment = await deliverOrder(getContainer(), order);

        await waitForEmails(getContainer(), "order-delivered", 1);

        await redeliverEvent(getContainer(), "delivery.created", {
          id: fulfillment.id,
          no_notification: false,
        });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-delivered",
        );

        expect(emails).toHaveLength(1);
      });
    });

    describe("customer email on order edit", () => {
      it("emails the shopper the items and total after a confirmed edit", async () => {
        const order = await createOrder(getContainer());

        await confirmOrderEdit(getContainer(), order, { quantity: 2 });
        const emails = await waitForEmails(getContainer(), "order-edited", 1);

        expect(emails).toHaveLength(1);
        expect(emails[0].to).toEqual(order.email);
        expect(emails[0].data?.order).toMatchObject({
          display_id: order.display_id,
          total: 84.85,
          items: expect.arrayContaining([
            expect.objectContaining({ title: "Beanie", quantity: 2 }),
          ]),
        });
      });

      it("sends nothing when the edit was requested without the notification", async () => {
        const order = await createOrder(getContainer());

        await confirmOrderEdit(getContainer(), order, {
          quantity: 2,
          no_notification: true,
        });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-edited",
        );

        expect(emails).toHaveLength(0);
      });

      it("sends nothing when the edited order has no email", async () => {
        const order = await createOrder(getContainer(), { email: undefined });

        await confirmOrderEdit(getContainer(), order, { quantity: 2 });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-edited",
        );

        expect(emails).toHaveLength(0);
      });

      it("does not email the shopper twice when the confirmed event is delivered again", async () => {
        const order = await createOrder(getContainer());
        const change = await confirmOrderEdit(getContainer(), order, {
          quantity: 2,
        });

        await waitForEmails(getContainer(), "order-edited", 1);

        await redeliverEvent(getContainer(), "order-edit.confirmed", {
          order_id: order.id,
          actions: change.actions,
          no_notification: false,
        });
        const emails = await listEmailsAfterSettling(
          getContainer(),
          "order-edited",
        );

        expect(emails).toHaveLength(1);
      });

      it("emails the shopper again when the order is edited a second time", async () => {
        const order = await createOrder(getContainer());

        await confirmOrderEdit(getContainer(), order, { quantity: 2 });

        await confirmOrderEdit(getContainer(), order, { quantity: 3 });
        const emails = await waitForEmails(getContainer(), "order-edited", 2);

        expect(emails).toHaveLength(2);
      });
    });
  },
});
