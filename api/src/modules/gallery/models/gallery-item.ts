import { model } from "@medusajs/framework/utils";

export const GalleryItem = model.define("gallery_item", {
  id: model.id().primaryKey(),
  url: model.text(),
  title: model.text(),
  rank: model.number(),
});
