import Medusa from "@medusajs/js-sdk";

export const sdk = new Medusa({
  baseUrl: __BACKEND_URL__,
  auth: { type: "session" },
});

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
