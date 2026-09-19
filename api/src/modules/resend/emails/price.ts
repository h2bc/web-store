import { BigNumberValue } from "@medusajs/framework/types";

export function getPriceFormatter(currencyCode: string) {
  const formatter = new Intl.NumberFormat([], {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: currencyCode,
  });

  return (price: BigNumberValue | null | undefined) => {
    const amount = Number(price);

    return Number.isFinite(amount) ? formatter.format(amount) : "";
  };
}
