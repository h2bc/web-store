import { defineRouteConfig } from "@medusajs/admin-sdk";
import { PlaySolid } from "@medusajs/icons";

import { GalleryEditor } from "../../components/gallery-editor";

export const config = defineRouteConfig({
  label: "Gallery",
  icon: PlaySolid,
  rank: 0,
});

export default function GalleryPage() {
  return <GalleryEditor />;
}
