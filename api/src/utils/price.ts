import { BigNumberValue } from "@medusajs/framework/types";

const LOCALE = "en-US";

export function formatPrice(
  amount?: BigNumberValue | null,
  currencyCode?: string | null,
): string {
  const value = Number(amount);

  if (amount == null || Number.isNaN(value) || !currencyCode) {
    return "NOT AVAILABLE";
  }

  const code = currencyCode.toUpperCase();
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: code,
  }).format(value);

  return `${formatted} ${code}`;
}
