import { model } from "@medusajs/framework/utils";

export const ContentPage = model.define("content_page", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  description: model.text(),
  body: model.text(),
});
