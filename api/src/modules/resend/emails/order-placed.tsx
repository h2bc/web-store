import { Container, Heading, Text } from "@react-email/components";
import { CustomerDTO, OrderDTO } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { OrderAddress, OrderItems, OrderTotals } from "./order-parts";

type OrderPlacedEmailProps = {
  order: OrderDTO & {
    customer: CustomerDTO;
  };
  logo_url?: string;
  contact_email?: string;
};

function OrderPlacedEmailComponent({
  order,
  logo_url,
  contact_email,
}: OrderPlacedEmailProps) {
  return (
    <EmailLayout
      preview={`Order #${order.display_id} has been confirmed. Thank you for your purchase!`}
      logo_url={logo_url}
      contact_email={contact_email}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          Thank you for your order,{" "}
          {order.customer?.first_name || order.shipping_address?.first_name}
        </Heading>
        <Text className="text-center text-gray-600 mt-2">
          Order #{order.display_id}. We're processing it and will notify you
          when it ships.
        </Text>
      </Container>

      <Container className="px-6">
        <OrderItems
          heading="Your items"
          items={order.items ?? []}
          currency_code={order.currency_code}
        />
        <OrderAddress
          heading="Delivering to"
          address={order.shipping_address}
        />
        <OrderTotals heading="Order summary" order={order} />
      </Container>
    </EmailLayout>
  );
}

export const orderPlacedEmail = (props: OrderPlacedEmailProps) => (
  <OrderPlacedEmailComponent {...props} />
);
