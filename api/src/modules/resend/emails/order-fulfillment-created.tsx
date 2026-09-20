import { Container, Heading, Text } from "@react-email/components";
import { OrderAddressDTO } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { EmailItem, OrderAddress, OrderItems } from "./order-parts";

type OrderFulfillmentCreatedEmailProps = {
  order: {
    display_id: number;
    shipping_address?: OrderAddressDTO | null;
  };
  items: EmailItem[];
  logo_url?: string;
  contact_email?: string;
};

function OrderFulfillmentCreatedEmailComponent({
  order,
  items,
  logo_url,
  contact_email,
}: OrderFulfillmentCreatedEmailProps) {
  return (
    <EmailLayout
      preview={`We are preparing your order #${order.display_id}`}
      logo_url={logo_url}
      contact_email={contact_email}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          We are preparing your order #{order.display_id}
        </Heading>
        <Text className="text-center text-gray-600 mt-2">
          We are packing your items and will email you again when they ship.
        </Text>
      </Container>

      <Container className="px-6">
        <OrderItems heading="Items being packed" items={items} />
        <OrderAddress
          heading="Delivering to"
          address={order.shipping_address}
        />
      </Container>
    </EmailLayout>
  );
}

export const orderFulfillmentCreatedEmail = (
  props: OrderFulfillmentCreatedEmailProps,
) => <OrderFulfillmentCreatedEmailComponent {...props} />;
