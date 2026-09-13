import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { saveGalleryWorkflow } from "../../../workflows/save-gallery";
import { GALLERY_MODULE } from "../../../modules/gallery";
import GalleryModuleService from "../../../modules/gallery/service";
import { AdminSaveGalleryType } from "./validators";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  res.json({
    videos: await req.scope
      .resolve<GalleryModuleService>(GALLERY_MODULE)
      .getGallery(),
  });
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminSaveGalleryType>,
  res: MedusaResponse,
) {
  await saveGalleryWorkflow(req.scope).run({ input: req.validatedBody });

  res.json({
    videos: await req.scope
      .resolve<GalleryModuleService>(GALLERY_MODULE)
      .getGallery(),
  });
}
