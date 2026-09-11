import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

/**
 * Send a real email through the configured notification provider.
 *
 *   npx medusa exec ./src/scripts/test-email.ts you@example.com [template]
 *
 * Templates: order-placed (default), user-invited, password-reset.
 * `order-placed` uses the most recent real order, falling back to the mock below.
 */
export default async function testEmail({ container, args }: ExecArgs) {
  const [to, template = "order-placed"] = args;
  if (!to) throw new Error("Usage: test-email.ts <email> [template]");

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notification = container.resolve(Modules.NOTIFICATION);

  let data: Record<string, unknown>;

  switch (template) {
    case "order-placed": {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "display_id",
          "currency_code",
          "total",
          "item_total",
          "tax_total",
          "items.*",
          "shipping_methods.*",
          "shipping_address.*",
          "customer.*",
        ],
        pagination: { take: 1, order: { created_at: "DESC" } },
      });

      if (orders[0]) {
        logger.info(`Using order #${orders[0].display_id}`);
        data = { order: orders[0] };
      } else {
        logger.info("No orders found, using mock order");
        data = mockOrder;
      }
      break;
    }
    case "user-invited":
      data = mockInvite;
      break;
    case "password-reset":
      data = mockPasswordReset;
      break;
    default:
      throw new Error(`Unknown template "${template}"`);
  }

  const [result] = await notification.createNotifications([
    { to, channel: "email", template, data },
  ]);

  logger.info(
    `Sent "${template}" to ${to} (id: ${result.provider_id ?? result.id})`,
  );
}

const mockInvite = {
  invite_url: "https://your-app.com/app/invite/sample-token-123",
  email: "user@example.com",
};

const mockPasswordReset = {
  reset_url: "https://your-app.com/reset-password?token=sample-reset-token-123",
  email: "user@example.com",
};

const mockOrder = {
  order: {
    id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
    display_id: 1,
    email: "shahednasser@gmail.com",
    currency_code: "eur",
    total: 20,
    subtotal: 20,
    discount_total: 0,
    shipping_total: 10,
    tax_total: 0,
    item_subtotal: 10,
    item_total: 10,
    item_tax_total: 0,
    customer_id: "cus_01JSNXD6VQC1YH56E4TGC81NWX",
    items: [
      {
        id: "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
        title: "L",
        subtitle: "Medusa Sweatshirt",
        thumbnail:
          "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
        variant_id: "variant_01JSNXAQCZ5X81A3NRSVFJ3ZHQ",
        product_id: "prod_01JSNXAQBQ6MFV5VHKN420NXQW",
        product_title: "Medusa Sweatshirt",
        product_description:
          "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
        product_subtitle: null,
        product_type: null,
        product_type_id: null,
        product_collection: null,
        product_handle: "sweatshirt",
        variant_sku: "SWEATSHIRT-L",
        variant_barcode: null,
        variant_title: "L",
        variant_option_values: null,
        requires_shipping: true,
        is_giftcard: false,
        is_discountable: true,
        is_tax_inclusive: false,
        is_custom_price: false,
        metadata: {},
        raw_compare_at_unit_price: null,
        raw_unit_price: {
          value: "10",
          precision: 20,
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        tax_lines: [],
        adjustments: [],
        compare_at_unit_price: null,
        unit_price: 10,
        quantity: 1,
        raw_quantity: {
          value: "1",
          precision: 20,
        },
        detail: {
          id: "orditem_01JSNXDH9DK1XMESEZPADYFWKY",
          version: 1,
          metadata: null,
          order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
          raw_unit_price: null,
          raw_compare_at_unit_price: null,
          raw_quantity: {
            value: "1",
            precision: 20,
          },
          raw_fulfilled_quantity: {
            value: "0",
            precision: 20,
          },
          raw_delivered_quantity: {
            value: "0",
            precision: 20,
          },
          raw_shipped_quantity: {
            value: "0",
            precision: 20,
          },
          raw_return_requested_quantity: {
            value: "0",
            precision: 20,
          },
          raw_return_received_quantity: {
            value: "0",
            precision: 20,
          },
          raw_return_dismissed_quantity: {
            value: "0",
            precision: 20,
          },
          raw_written_off_quantity: {
            value: "0",
            precision: 20,
          },
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          item_id: "ordli_01JSNXDH9C47KZ43WQ3TBFXZA9",
          unit_price: null,
          compare_at_unit_price: null,
          quantity: 1,
          fulfilled_quantity: 0,
          delivered_quantity: 0,
          shipped_quantity: 0,
          return_requested_quantity: 0,
          return_received_quantity: 0,
          return_dismissed_quantity: 0,
          written_off_quantity: 0,
        },
        subtotal: 10,
        total: 10,
        original_total: 10,
        discount_total: 0,
        discount_subtotal: 0,
        discount_tax_total: 0,
        tax_total: 0,
        original_tax_total: 0,
        refundable_total_per_unit: 10,
        refundable_total: 10,
        fulfilled_total: 0,
        shipped_total: 0,
        return_requested_total: 0,
        return_received_total: 0,
        return_dismissed_total: 0,
        write_off_total: 0,
        raw_subtotal: {
          value: "10",
          precision: 20,
        },
        raw_total: {
          value: "10",
          precision: 20,
        },
        raw_original_total: {
          value: "10",
          precision: 20,
        },
        raw_discount_total: {
          value: "0",
          precision: 20,
        },
        raw_discount_subtotal: {
          value: "0",
          precision: 20,
        },
        raw_discount_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_original_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_refundable_total_per_unit: {
          value: "10",
          precision: 20,
        },
        raw_refundable_total: {
          value: "10",
          precision: 20,
        },
        raw_fulfilled_total: {
          value: "0",
          precision: 20,
        },
        raw_shipped_total: {
          value: "0",
          precision: 20,
        },
        raw_return_requested_total: {
          value: "0",
          precision: 20,
        },
        raw_return_received_total: {
          value: "0",
          precision: 20,
        },
        raw_return_dismissed_total: {
          value: "0",
          precision: 20,
        },
        raw_write_off_total: {
          value: "0",
          precision: 20,
        },
      },
    ],
    shipping_address: {
      id: "caaddr_01JSNXD6W0TGPH2JQD18K97B25",
      customer_id: null,
      company: "",
      first_name: "shahed",
      last_name: "nasser",
      address_1: "asfasf",
      address_2: "",
      city: "asfasf",
      country_code: "dk",
      province: "",
      postal_code: "asfasf",
      phone: "",
      metadata: null,
      created_at: "2025-04-25T07:25:48.801Z",
      updated_at: "2025-04-25T07:25:48.801Z",
      deleted_at: null,
    },
    billing_address: {
      id: "caaddr_01JSNXD6W0V7RNZH63CPG26K5W",
      customer_id: null,
      company: "",
      first_name: "shahed",
      last_name: "nasser",
      address_1: "asfasf",
      address_2: "",
      city: "asfasf",
      country_code: "dk",
      province: "",
      postal_code: "asfasf",
      phone: "",
      metadata: null,
      created_at: "2025-04-25T07:25:48.801Z",
      updated_at: "2025-04-25T07:25:48.801Z",
      deleted_at: null,
    },
    shipping_methods: [
      {
        id: "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
        name: "Standard Shipping",
        description: null,
        is_tax_inclusive: false,
        is_custom_amount: false,
        shipping_option_id: "so_01JSNXAQA64APG6BNHGCMCTN6V",
        data: {},
        metadata: null,
        raw_amount: {
          value: "10",
          precision: 20,
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        tax_lines: [],
        adjustments: [],
        amount: 10,
        order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
        detail: {
          id: "ordspmv_01JSNXDH9B5RAF4FH3M1HH3TEA",
          version: 1,
          order_id: "order_01JSNXDH9BPJWWKVW03B9E9KW8",
          return_id: null,
          exchange_id: null,
          claim_id: null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          shipping_method_id: "ordsm_01JSNXDH9B9DDRQXJT5J5AE5V1",
        },
        subtotal: 10,
        total: 10,
        original_total: 10,
        discount_total: 0,
        discount_subtotal: 0,
        discount_tax_total: 0,
        tax_total: 0,
        original_tax_total: 0,
        raw_subtotal: {
          value: "10",
          precision: 20,
        },
        raw_total: {
          value: "10",
          precision: 20,
        },
        raw_original_total: {
          value: "10",
          precision: 20,
        },
        raw_discount_total: {
          value: "0",
          precision: 20,
        },
        raw_discount_subtotal: {
          value: "0",
          precision: 20,
        },
        raw_discount_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_tax_total: {
          value: "0",
          precision: 20,
        },
        raw_original_tax_total: {
          value: "0",
          precision: 20,
        },
      },
    ],
    customer: {
      id: "cus_01JSNXD6VQC1YH56E4TGC81NWX",
      company_name: null,
      first_name: null,
      last_name: null,
      email: "afsaf@gmail.com",
      phone: null,
      has_account: false,
      metadata: null,
      created_by: null,
      created_at: "2025-04-25T07:25:48.791Z",
      updated_at: "2025-04-25T07:25:48.791Z",
      deleted_at: null,
    },
  },
};
