import { MedusaContainer } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { sendOrderConfirmationWorkflow } from "../../src/workflows/send-order-confirmation";

export const ORDER_INBOX = "orders@example.com";
export const BACKEND_URL = "https://api.example.com";

export const ORDER = {
  email: "buyer@example.com",
  currency_code: "eur",
  items: [
    { title: "Beanie", variant_title: "Black", quantity: 1, unit_price: 24.95 },
    { title: "Belt", variant_title: "M", quantity: 1, unit_price: 34.95 },
  ],
  shipping_address: {
    first_name: "Jonas",
    last_name: "Jonaitis",
    address_1: "Gedimino pr. 1",
    city: "Vilnius",
    postal_code: "01103",
    country_code: "lt",
  },
  shipping_methods: [{ name: "Standard Shipping LT", amount: 0 }],
};

export async function runWithoutEnv<T>(key: string, run: () => Promise<T>) {
  const value = process.env[key];

  delete process.env[key];

  return run().finally(() => {
    process.env[key] = value;
  });
}

type OrderOverrides = {
  email?: string;
  shipping_methods?: {
    name: string;
    amount: number;
    shipping_option_id?: string;
  }[];
};

export async function createOrder(
  container: MedusaContainer,
  overrides: OrderOverrides = {},
) {
  return container
    .resolve(Modules.ORDER)
    .createOrders({ ...ORDER, ...overrides });
}

export async function placeOrder(container: MedusaContainer, id: string) {
  return sendOrderConfirmationWorkflow(container).run({ input: { id } });
}

export async function createPlacedOrder(container: MedusaContainer) {
  const order = await createOrder(container);

  await placeOrder(container, order.id);

  return order;
}

export function listNotifications(
  container: MedusaContainer,
  filters: { template: string; channel: string },
) {
  return container.resolve(Modules.NOTIFICATION).listNotifications(filters);
}

export function listOwnerEmails(container: MedusaContainer) {
  return listNotifications(container, {
    template: "order-placed-owner",
    channel: "email",
  });
}

export function listCustomerEmails(container: MedusaContainer) {
  return listNotifications(container, {
    template: "order-placed",
    channel: "email",
  });
}
