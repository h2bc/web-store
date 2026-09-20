export type FulfillmentItem = {
  id: string;
  title: string;
  quantity: number;
  line_item_id: string | null;
};

export type OrderLine = {
  id: string;
  product_title?: string | null;
  variant_title?: string | null;
  thumbnail?: string | null;
};

export const getFulfilledItems = (
  items: FulfillmentItem[],
  lines: OrderLine[] = [],
) =>
  items.map((item) => ({
    ...lines.find((line) => line.id === item.line_item_id),
    id: item.id,
    title: item.title,
    quantity: item.quantity,
  }));
