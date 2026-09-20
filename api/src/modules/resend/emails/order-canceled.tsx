import { Container, Heading, Text } from "@react-email/components";
import { BigNumberValue } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { getPriceFormatter } from "./price";
import { EmailItem, OrderItems } from "./order-parts";

type OrderCanceledEmailProps = {
  order: {
    display_id: number;
    currency_code: string;
    items: EmailItem[];
  };
  refunded_total: BigNumberValue;
  logo_url?: string;
  contact_email?: string;
};

function OrderCanceledEmailComponent({
  order,
  refunded_total,
  logo_url,
  contact_email,
}: OrderCanceledEmailProps) {
  const formatPrice = getPriceFormatter(order.currency_code);

  return (
    <EmailLayout
      preview={`Your order #${order.display_id} was cancelled`}
      logo_url={logo_url}
      contact_email={contact_email}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          Your order #{order.display_id} was cancelled
        </Heading>
        {Number(refunded_total) > 0 && (
          <Text className="text-center text-gray-600 mt-2">
            We refunded {formatPrice(refunded_total)} to your original payment
            method. It can take a few days to show up.
          </Text>
        )}
      </Container>

      <Container className="px-6">
        <OrderItems heading="Cancelled items" items={order.items} />
      </Container>
    </EmailLayout>
  );
}

export const orderCanceledEmail = (props: OrderCanceledEmailProps) => (
  <OrderCanceledEmailComponent {...props} />
);
