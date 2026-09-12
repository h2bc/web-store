import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { GALLERY_MODULE } from "../../modules/gallery";
import GalleryModuleService from "../../modules/gallery/service";

const VIDEOS = [
  { url: "https://www.youtube.com/embed/srRVUe4_wW4", title: "verkei?" },
  { url: "https://www.youtube.com/embed/C8Hkml0CRmo", title: "meduza" },
  { url: "https://www.youtube.com/embed/qI8fDbBXW2s", title: "2DRIP" },
];

export default async function seedGallery({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const gallery = container.resolve<GalleryModuleService>(GALLERY_MODULE);

  logger.info("Gallery");
  await gallery.createGalleryItems(
    VIDEOS.map((video, rank) => ({ ...video, rank })),
  );
}
