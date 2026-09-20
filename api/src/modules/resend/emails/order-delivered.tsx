import { Container, Heading, Text } from "@react-email/components";
import { OrderAddressDTO } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { EmailItem, OrderAddress, OrderItems } from "./order-parts";

type OrderDeliveredEmailProps = {
  order: {
    display_id: number;
    shipping_address?: OrderAddressDTO | null;
  };
  items: EmailItem[];
  logo_url?: string;
  contact_email?: string;
};

function OrderDeliveredEmailComponent({
  order,
  items,
  logo_url,
  contact_email,
}: OrderDeliveredEmailProps) {
  return (
    <EmailLayout
      preview={`Your order #${order.display_id} was delivered`}
      logo_url={logo_url}
      contact_email={contact_email}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          Your order #{order.display_id} was delivered
        </Heading>
        <Text className="text-center text-gray-600 mt-2">
          Your parcel has been delivered. Enjoy.
        </Text>
      </Container>

      <Container className="px-6">
        <OrderItems heading="Delivered items" items={items} />
        <OrderAddress heading="Delivered to" address={order.shipping_address} />
      </Container>
    </EmailLayout>
  );
}

export const orderDeliveredEmail = (props: OrderDeliveredEmailProps) => (
  <OrderDeliveredEmailComponent {...props} />
);
