import {
  Text,
  Column,
  Container,
  Heading,
  Img,
  Row,
  Section,
  Link,
} from "@react-email/components";
import { EmailLayout } from "./layout";
import {
  BigNumberValue,
  CustomerDTO,
  OrderDTO,
} from "@medusajs/framework/types";

type OrderPlacedEmailProps = {
  order: OrderDTO & {
    customer: CustomerDTO;
  };
  email_banner?: {
    body: string;
    title: string;
    url: string;
  };
  logo_url?: string;
};

function OrderPlacedEmailComponent({
  order,
  email_banner,
  logo_url,
}: OrderPlacedEmailProps) {
  const shouldDisplayBanner = email_banner && "title" in email_banner;

  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: order.currency_code,
  });

  const formatPrice = (price: BigNumberValue) => {
    const amount = Number(price);

    return Number.isFinite(amount) ? formatter.format(amount) : "";
  };

  return (
    <EmailLayout
      preview={`Order #${order.display_id} has been confirmed. Thank you for your purchase!`}
      logo_url={logo_url}
    >
      {/* Thank You Message */}
      <Container className="p-6">
        <Heading className="text-2xl font-bold text-center text-gray-800">
          Thank you for your order,{" "}
          {order.customer?.first_name || order.shipping_address?.first_name}
        </Heading>
        <Text className="text-center text-gray-600 mt-2">
          We're processing your order and will notify you when it ships.
        </Text>
      </Container>

      {/* Promotional Banner */}
      {shouldDisplayBanner && (
        <Container
          className="mb-4 rounded-lg p-7"
          style={{
            background: "linear-gradient(to right, #3b82f6, #4f46e5)",
          }}
        >
          <Section>
            <Row>
              <Column align="left">
                <Heading className="text-white text-xl font-semibold">
                  {email_banner.title}
                </Heading>
                <Text className="text-white mt-2">{email_banner.body}</Text>
              </Column>
              <Column align="right">
                <Link
                  href={email_banner.url}
                  className="font-semibold px-2 text-white underline"
                >
                  Shop Now
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      )}

      {/* Order Items */}
      <Container className="px-6">
        <Heading className="text-xl font-semibold text-gray-800 mb-4">
          Your Items
        </Heading>
        <Row>
          <Column>
            <Text className="text-sm m-0 my-2 text-gray-500">
              Order ID: #{order.display_id}
            </Text>
          </Column>
        </Row>
        {order.items?.map((item) => (
          <Section key={item.id} className="border-b border-gray-200 py-4">
            <Row>
              <Column className="w-1/3">
                <Img
                  src={item.thumbnail ?? ""}
                  alt={item.product_title ?? ""}
                  className="rounded-lg"
                  width="100%"
                />
              </Column>
              <Column className="w-2/3 pl-4">
                <Text className="text-lg font-semibold text-gray-800">
                  {item.product_title}
                </Text>
                <Text className="text-gray-600">{item.variant_title}</Text>
                <Text className="text-gray-800 mt-2 font-bold">
                  {formatPrice(item.total)}
                </Text>
              </Column>
            </Row>
          </Section>
        ))}

        {/* Order Summary */}
        <Section className="mt-8">
          <Heading className="text-xl font-semibold text-gray-800 mb-4">
            Order Summary
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

export const orderPlacedEmail = (props: OrderPlacedEmailProps) => (
  <OrderPlacedEmailComponent {...props} />
);
