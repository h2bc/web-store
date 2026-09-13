import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TruckFast } from "@medusajs/icons";

import { ContentPageCard } from "../../components/content-page-card";

export const config = defineRouteConfig({
  label: "Shipping & Returns",
  icon: TruckFast,
  rank: 3,
});

export default function ShippingReturnsPage() {
  return <ContentPageCard slug="shipping-returns" label="Shipping & Returns" />;
}
