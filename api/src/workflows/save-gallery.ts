import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { GALLERY_MODULE } from "../modules/gallery";
import GalleryModuleService from "../modules/gallery/service";

export type SaveGalleryInput = {
  videos: { url: string; title: string }[];
};

type StoredVideo = {
  id: string;
  url: string;
  title: string;
  rank: number;
};

type SaveGalleryCompensation = {
  previous: StoredVideo[];
  createdIds: string[];
};

const saveGalleryStep = createStep(
  "save-gallery",
  async ({ videos }: SaveGalleryInput, { container }) => {
    const gallery = container.resolve<GalleryModuleService>(GALLERY_MODULE);
    const previous = await gallery.listGalleryItems(
      {},
      { order: { rank: "ASC" } },
    );

    await gallery.deleteGalleryItems(previous.map((video) => video.id));

    const created = await gallery.createGalleryItems(
      videos.map((video, rank) => ({ ...video, rank })),
    );

    return new StepResponse(created, {
      previous: previous.map(({ id, url, title, rank }) => ({
        id,
        url,
        title,
        rank,
      })),
      createdIds: created.map((video) => video.id),
    } satisfies SaveGalleryCompensation);
  },
  async (data: SaveGalleryCompensation | undefined, { container }) => {
    if (!data) return;

    const gallery = container.resolve<GalleryModuleService>(GALLERY_MODULE);

    await gallery.deleteGalleryItems(data.createdIds);
    await gallery.createGalleryItems(data.previous);
  },
);

export const saveGalleryWorkflow = createWorkflow(
  "save-gallery",
  (input: SaveGalleryInput) => new WorkflowResponse(saveGalleryStep(input)),
);
