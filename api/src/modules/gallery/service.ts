import { MedusaService } from "@medusajs/framework/utils";

import { GalleryItem } from "./models/gallery-item";

export type GalleryVideo = {
  id: string;
  url: string;
  title: string;
};

class GalleryModuleService extends MedusaService({ GalleryItem }) {
  async getGallery(): Promise<GalleryVideo[]> {
    const items = await this.listGalleryItems({}, { order: { rank: "ASC" } });

    return items.map(({ id, url, title }) => ({ id, url, title }));
  }
}

export default GalleryModuleService;
