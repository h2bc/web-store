import { CONTACT_MESSAGE } from "./support/data";
import { expect, test } from "./support/fixtures";

test("shopper sends a message and is told it went through", async ({ contact }) => {
  await test.step("Given a shopper on the contact page", async () => {
    await contact.open();
  });

  await test.step("When they fill in the form and send it", async () => {
    await contact.fillMessage(CONTACT_MESSAGE);
    await contact.send();
  });

  await test.step("Then the form is replaced by the confirmation", async () => {
    await expect(contact.getSentConfirmation()).toBeVisible();
    await expect(contact.getMessageField()).toBeHidden();
  });

  await test.step("And they can start a new empty message", async () => {
    await contact.getSendAnotherButton().click();
    await expect(contact.getMessageField()).toHaveValue("");
  });
});

test("shopper can reach the shop on Instagram instead", async ({ contact }) => {
  await test.step("Given a shopper on the contact page", async () => {
    await contact.open();
  });

  await test.step("Then the Instagram link is offered beside the form", async () => {
    await expect(contact.getInstagramLink()).toBeVisible();
  });
});
