import { defineRouteConfig } from "@medusajs/admin-sdk";
import { LockClosedSolid } from "@medusajs/icons";

import { ContentPageCard } from "../../components/content-page-card";

export const config = defineRouteConfig({
  label: "Privacy Policy",
  icon: LockClosedSolid,
  rank: 1,
});

export default function PrivacyPage() {
  return <ContentPageCard slug="privacy" label="Privacy Policy" />;
}
