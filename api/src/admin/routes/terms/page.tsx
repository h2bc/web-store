import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";

import { ContentPageCard } from "../../components/content-page-card";

export const config = defineRouteConfig({
  label: "Terms & Conditions",
  icon: DocumentText,
  rank: 2,
});

export default function TermsPage() {
  return <ContentPageCard slug="terms" label="Terms & Conditions" />;
}
