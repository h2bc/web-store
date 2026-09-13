import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

type Api = {
  post: (
    path: string,
    body: unknown,
    config: { headers: Record<string, string> },
  ) => Promise<{ status: number; data: { message?: string } }>;
};

type Response = { status: number; data: { message?: string } };

export const INBOX = "inbox@example.com";

export const VALID_MESSAGE = {
  name: "Jonas",
  email: "jonas@example.com",
  topic: "Returns & Refunds",
  message: "I would like to return my order.",
};

export async function createPublishableKey(
  container: MedusaContainer,
): Promise<string> {
  const [key] = await container
    .resolve(Modules.API_KEY)
    .createApiKeys([
      { title: "storefront", type: "publishable", created_by: "test" },
    ]);

  return key.token;
}

export function listContactNotifications(container: MedusaContainer) {
  return container
    .resolve(Modules.NOTIFICATION)
    .listNotifications({ template: "contact-message" });
}

export function postContact(
  api: Api,
  body: unknown,
  headers: Record<string, string>,
): Promise<Response> {
  return api
    .post("/store/contact", body, { headers })
    .catch((error: { response: Response }) => error.response);
}
