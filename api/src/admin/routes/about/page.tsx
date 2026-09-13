import { defineRouteConfig } from "@medusajs/admin-sdk";
import { InformationCircle } from "@medusajs/icons";

import { ContentPageCard } from "../../components/content-page-card";

export const config = defineRouteConfig({
  label: "About",
  icon: InformationCircle,
  rank: 4,
});

export default function AboutPage() {
  return <ContentPageCard slug="about" label="About" />;
}
