import { Container, Heading, Section, Text } from "@react-email/components";
import { BigNumberValue } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { getPriceFormatter } from "./price";
import { EmailItem, OrderItems } from "./order-parts";

type OrderEditedEmailProps = {
  order: {
    display_id: number;
    currency_code: string;
    total: BigNumberValue;
    items: EmailItem[];
  };
  logo_url?: string;
  contact_email?: string;
};

function OrderEditedEmailComponent({
  order,
  logo_url,
  contact_email,
}: OrderEditedEmailProps) {
  const formatPrice = getPriceFormatter(order.currency_code);

  return (
    <EmailLayout
      preview={`Your order #${order.display_id} was changed`}
      logo_url={logo_url}
      contact_email={contact_email}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          Your order #{order.display_id} was changed
        </Heading>
        <Text className="text-center text-gray-600 mt-2">
          Here is your order as it stands now.
        </Text>
      </Container>

      <Container className="px-6">
        <OrderItems
          heading="Your items"
          items={order.items}
          currency_code={order.currency_code}
        />

        <Section className="mt-8">
          <Text className="m-0 font-semibold text-gray-800">
            New total: {formatPrice(order.total)}
          </Text>
        </Section>
      </Container>
    </EmailLayout>
  );
}

export const orderEditedEmail = (props: OrderEditedEmailProps) => (
  <OrderEditedEmailComponent {...props} />
);
