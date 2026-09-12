import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { GALLERY_MODULE } from "../../../modules/gallery";
import GalleryModuleService from "../../../modules/gallery/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const gallery = req.scope.resolve<GalleryModuleService>(GALLERY_MODULE);

  res.json({ videos: await gallery.getGallery() });
}
