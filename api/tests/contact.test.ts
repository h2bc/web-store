import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import {
  createStoreClient,
  INBOX,
  listContactNotifications,
  postContact,
  VALID_MESSAGE,
} from "./support/contact";

jest.setTimeout(60 * 1000);

medusaIntegrationTestRunner({
  inApp: true,
  env: { CONTACT_INBOX_EMAIL: INBOX },
  testSuite: ({ api, getContainer }) => {
    describe("POST /store/contact", () => {
      it("records one message for the shop inbox with the sender as reply-to", async () => {
        const client = await createStoreClient(getContainer(), "10.0.0.1");

        const response = await postContact(api, VALID_MESSAGE, client);
        const notifications = await listContactNotifications(getContainer());

        expect(response.status).toEqual(200);
        expect(notifications).toHaveLength(1);
        expect(notifications[0].to).toEqual(INBOX);
        expect(notifications[0].data?.reply_to).toEqual(VALID_MESSAGE.email);
      });

      it("rejects a body without a message and names the field", async () => {
        const client = await createStoreClient(getContainer(), "10.0.0.2");
        const { name, email, topic } = VALID_MESSAGE;

        const response = await postContact(api, { name, email, topic }, client);

        expect(response.status).toEqual(400);
        expect(response.data.message).toContain("message");
      });

      it("accepts a bot that fills the honeypot without recording anything", async () => {
        const client = await createStoreClient(getContainer(), "10.0.0.3");
        const before = await listContactNotifications(getContainer());

        const response = await postContact(
          api,
          { ...VALID_MESSAGE, website: "https://spam.example" },
          client,
        );
        const after = await listContactNotifications(getContainer());

        expect(response.status).toEqual(200);
        expect(after).toHaveLength(before.length);
      });

      it("refuses the sixth message from the same address within fifteen minutes", async () => {
        const client = await createStoreClient(getContainer(), "10.0.0.4");
        const accepted = await Promise.all(
          Array.from({ length: 5 }, () =>
            postContact(api, VALID_MESSAGE, client),
          ),
        );
        const before = await listContactNotifications(getContainer());

        const sixth = await postContact(api, VALID_MESSAGE, client);
        const after = await listContactNotifications(getContainer());

        expect(accepted.map((response) => response.status)).toEqual([
          200, 200, 200, 200, 200,
        ]);
        expect(sixth.status).toEqual(429);
        expect(after).toHaveLength(before.length);
      });

      it("accepts a second visitor through the storefront after the first used up the limit", async () => {
        const first = await createStoreClient(
          getContainer(),
          "203.0.113.6, 172.16.0.2",
        );
        const second = await createStoreClient(
          getContainer(),
          "203.0.113.7, 172.16.0.2",
        );

        await Promise.all(
          Array.from({ length: 5 }, () =>
            postContact(api, VALID_MESSAGE, first),
          ),
        );
        const before = await listContactNotifications(getContainer());

        const response = await postContact(api, VALID_MESSAGE, second);
        const after = await listContactNotifications(getContainer());

        expect(response.status).toEqual(200);
        expect(after).toHaveLength(before.length + 1);
      });

      it("refuses a client who forges a new forwarded address after using up the limit", async () => {
        const client = await createStoreClient(
          getContainer(),
          "198.51.100.1, 203.0.113.8",
        );
        const forged = await createStoreClient(
          getContainer(),
          "198.51.100.2, 203.0.113.8",
        );

        await Promise.all(
          Array.from({ length: 5 }, () =>
            postContact(api, VALID_MESSAGE, client),
          ),
        );
        const before = await listContactNotifications(getContainer());

        const response = await postContact(api, VALID_MESSAGE, forged);
        const after = await listContactNotifications(getContainer());

        expect(response.status).toEqual(429);
        expect(after).toHaveLength(before.length);
      });

      it("fails with a configuration error and records nothing when the inbox is not set", async () => {
        const client = await createStoreClient(getContainer(), "10.0.0.5");
        const before = await listContactNotifications(getContainer());

        delete process.env.CONTACT_INBOX_EMAIL;

        const response = await postContact(api, VALID_MESSAGE, client).finally(
          () => {
            process.env.CONTACT_INBOX_EMAIL = INBOX;
          },
        );
        const after = await listContactNotifications(getContainer());

        expect(response.status).toEqual(500);
        expect(after).toHaveLength(before.length);
      });
    });
  },
});
