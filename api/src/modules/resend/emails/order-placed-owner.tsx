import {
  Button,
  Container,
  Heading,
  Section,
  Text,
} from "@react-email/components";
import { OrderDTO } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { getPriceFormatter } from "./price";
import { OrderAddress, OrderItems, OrderTotals } from "./order-parts";

type OrderPlacedOwnerEmailProps = {
  order: OrderDTO;
  admin_url: string;
  logo_url?: string;
};

function OrderPlacedOwnerEmailComponent({
  order,
  admin_url,
  logo_url,
}: OrderPlacedOwnerEmailProps) {
  const formatPrice = getPriceFormatter(order.currency_code);

  return (
    <EmailLayout
      preview={`New order #${order.display_id}, ${formatPrice(order.total)}`}
      logo_url={logo_url}
      footer="Sent to the order inbox each time an order is placed."
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          New order #{order.display_id}
        </Heading>
        <Text className="text-center text-gray-600 mt-2">
          {order.email ?? "No email given"}
        </Text>
        <Section className="text-center mt-4">
          <Button
            href={admin_url}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Open in admin
          </Button>
        </Section>
      </Container>

      <Container className="px-6">
        <OrderItems
          heading="Items"
          items={order.items ?? []}
          currency_code={order.currency_code}
        />
        <OrderAddress heading="Ship to" address={order.shipping_address} />
        <OrderTotals heading="Totals" order={order} />
      </Container>
    </EmailLayout>
  );
}

export const orderPlacedOwnerEmail = (props: OrderPlacedOwnerEmailProps) => (
  <OrderPlacedOwnerEmailComponent {...props} />
);
