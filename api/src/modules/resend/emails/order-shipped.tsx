import {
  Container,
  Heading,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { OrderAddressDTO } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { getAddressLines } from "./address";

type OrderShippedEmailProps = {
  order: {
    display_id: number;
    shipping_address?: OrderAddressDTO | null;
  };
  items: { id: string; title: string; quantity: number }[];
  tracking: { id: string; tracking_number: string; tracking_url?: string }[];
  logo_url?: string;
  contact_email?: string;
};

function OrderShippedEmailComponent({
  order,
  items,
  tracking,
  logo_url,
  contact_email,
}: OrderShippedEmailProps) {
  return (
    <EmailLayout
      preview={`Your order #${order.display_id} is on its way`}
      logo_url={logo_url}
      contact_email={contact_email}
    >
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          Your order #{order.display_id} is on its way
        </Heading>
        <Text className="text-center text-gray-600 mt-2">
          We have handed your parcel to the carrier.
        </Text>
      </Container>

      <Container className="px-6">
        <Heading className="text-xl font-semibold text-gray-800 mb-4">
          Shipped items
        </Heading>
        {items.map((item) => (
          <Text key={item.id} className="m-0 text-gray-800">
            {Number(item.quantity)} × {item.title}
          </Text>
        ))}

        {tracking.length > 0 && (
          <Section className="mt-8">
            <Heading className="text-xl font-semibold text-gray-800 mb-4">
              Tracking
            </Heading>
            {tracking.map((label) => (
              <Text key={label.id} className="m-0 text-gray-800">
                {label.tracking_url ? (
                  <Link href={label.tracking_url}>{label.tracking_number}</Link>
                ) : (
                  label.tracking_number
                )}
              </Text>
            ))}
          </Section>
        )}

        <Section className="mt-8">
          <Heading className="text-xl font-semibold text-gray-800 mb-4">
            Delivering to
          </Heading>
          {getAddressLines(order.shipping_address).map((line) => (
            <Text key={line} className="m-0 text-gray-800">
              {line}
            </Text>
          ))}
        </Section>
      </Container>
    </EmailLayout>
  );
}

export const orderShippedEmail = (props: OrderShippedEmailProps) => (
  <OrderShippedEmailComponent {...props} />
);
