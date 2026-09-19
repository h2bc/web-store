import {
  Button,
  Column,
  Container,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { OrderDTO } from "@medusajs/framework/types";
import { EmailLayout } from "./layout";
import { getPriceFormatter } from "./price";
import { getAddressLines } from "./address";

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
        <Heading className="text-xl font-semibold text-gray-800 mb-4">
          Items
        </Heading>
        {order.items?.map((item) => (
          <Row key={item.id} className="border-b border-gray-200 py-2">
            <Column className="w-2/3">
              <Text className="m-0 text-gray-800 font-semibold">
                {Number(item.quantity)} × {item.product_title}
              </Text>
              <Text className="m-0 text-gray-600">{item.variant_title}</Text>
            </Column>
            <Column className="w-1/3 text-right">
              <Text className="m-0 text-gray-800">
                {formatPrice(item.total)}
              </Text>
            </Column>
          </Row>
        ))}

        <Section className="mt-8">
          <Heading className="text-xl font-semibold text-gray-800 mb-4">
            Ship to
          </Heading>
          {getAddressLines(order.shipping_address).map((line) => (
            <Text key={line} className="m-0 text-gray-800">
              {line}
            </Text>
          ))}
          {order.shipping_methods?.map((method) => (
            <Text key={method.id} className="mt-4 text-gray-600">
              {method.name}
            </Text>
          ))}
        </Section>

        <Section className="mt-8">
          <Heading className="text-xl font-semibold text-gray-800 mb-4">
            Totals
          </Heading>
          <Row className="text-gray-600">
            <Column className="w-1/2">
              <Text className="m-0">Subtotal</Text>
            </Column>
            <Column className="w-1/2 text-right">
              <Text className="m-0">{formatPrice(order.item_total)}</Text>
            </Column>
          </Row>
          {order.shipping_methods?.map((method) => (
            <Row className="text-gray-600" key={method.id}>
              <Column className="w-1/2">
                <Text className="m-0">{method.name}</Text>
              </Column>
              <Column className="w-1/2 text-right">
                <Text className="m-0">{formatPrice(method.total)}</Text>
              </Column>
            </Row>
          ))}
          <Row className="text-gray-600">
            <Column className="w-1/2">
              <Text className="m-0">Tax</Text>
            </Column>
            <Column className="w-1/2 text-right">
              <Text className="m-0">{formatPrice(order.tax_total || 0)}</Text>
            </Column>
          </Row>
          <Row className="border-t border-gray-200 mt-4 text-gray-800 font-bold">
            <Column className="w-1/2">
              <Text>Total</Text>
            </Column>
            <Column className="w-1/2 text-right">
              <Text>{formatPrice(order.total)}</Text>
            </Column>
          </Row>
        </Section>
      </Container>
    </EmailLayout>
  );
}

export const orderPlacedOwnerEmail = (props: OrderPlacedOwnerEmailProps) => (
  <OrderPlacedOwnerEmailComponent {...props} />
);
