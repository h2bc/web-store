import {
  Column,
  Heading,
  Img,
  Row,
  Section,
  Text,
} from "@react-email/components";
import {
  BigNumberValue,
  OrderAddressDTO,
  OrderDTO,
} from "@medusajs/framework/types";
import { getAddressLines } from "./address";
import { getPriceFormatter } from "./price";

export type EmailItem = {
  id: string;
  title: string;
  product_title?: string | null;
  variant_title?: string | null;
  thumbnail?: string | null;
  quantity: BigNumberValue;
  total?: BigNumberValue;
};

type OrderItemsProps = {
  heading: string;
  items: EmailItem[];
  currency_code?: string;
};

export function OrderItems({ heading, items, currency_code }: OrderItemsProps) {
  const formatPrice = currency_code ? getPriceFormatter(currency_code) : null;

  return (
    <Section>
      <Heading className="text-xl font-semibold text-gray-800 mb-4">
        {heading}
      </Heading>
      {items.map((item) => (
        <Section key={item.id} className="border-b border-gray-200 py-4">
          <Row>
            {item.thumbnail && (
              <Column className="w-1/3">
                <Img
                  src={item.thumbnail}
                  alt={item.product_title ?? item.title}
                  className="rounded-lg"
                  width="100%"
                />
              </Column>
            )}
            <Column className={item.thumbnail ? "w-2/3 pl-4" : "w-full"}>
              <Text className="m-0 text-lg font-semibold text-gray-800">
                {Number(item.quantity)} × {item.product_title ?? item.title}
              </Text>
              {item.variant_title && (
                <Text className="m-0 text-gray-600">{item.variant_title}</Text>
              )}
              {formatPrice && (
                <Text className="m-0 mt-2 font-bold text-gray-800">
                  {formatPrice(item.total)}
                </Text>
              )}
            </Column>
          </Row>
        </Section>
      ))}
    </Section>
  );
}

type OrderAddressProps = {
  heading: string;
  address?: OrderAddressDTO | null;
};

export function OrderAddress({ heading, address }: OrderAddressProps) {
  return (
    <Section className="mt-8">
      <Heading className="text-xl font-semibold text-gray-800 mb-4">
        {heading}
      </Heading>
      {getAddressLines(address).map((line) => (
        <Text key={line} className="m-0 text-gray-800">
          {line}
        </Text>
      ))}
    </Section>
  );
}

type OrderTotalsProps = {
  heading: string;
  order: Pick<
    OrderDTO,
    "currency_code" | "item_total" | "tax_total" | "total" | "shipping_methods"
  >;
};

export function OrderTotals({ heading, order }: OrderTotalsProps) {
  const formatPrice = getPriceFormatter(order.currency_code);
  const lines = [
    { id: "subtotal", name: "Subtotal", amount: order.item_total },
    ...(order.shipping_methods ?? []).map((method) => ({
      id: method.id,
      name: method.name,
      amount: method.total,
    })),
    { id: "tax", name: "Tax", amount: order.tax_total || 0 },
  ];

  return (
    <Section className="mt-8">
      <Heading className="text-xl font-semibold text-gray-800 mb-4">
        {heading}
      </Heading>
      {lines.map((line) => (
        <Row className="text-gray-600" key={line.id}>
          <Column className="w-1/2">
            <Text className="m-0">{line.name}</Text>
          </Column>
          <Column className="w-1/2 text-right">
            <Text className="m-0">{formatPrice(line.amount)}</Text>
          </Column>
        </Row>
      ))}
      <Row className="border-t border-gray-200 mt-4 text-gray-800 font-bold">
        <Column className="w-1/2">
          <Text>Total</Text>
        </Column>
        <Column className="w-1/2 text-right">
          <Text>{formatPrice(order.total)}</Text>
        </Column>
      </Row>
    </Section>
  );
}
