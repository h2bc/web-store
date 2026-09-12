import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { CONTENT_PAGE_MODULE } from "../modules/content-page";
import ContentPageModuleService from "../modules/content-page/service";
import { ContentPageSlug } from "../modules/content-page/types";

export type SaveContentPageInput = {
  slug: ContentPageSlug;
  description: string;
  body: string;
};

type Previous = {
  id: string;
  description: string;
  body: string;
};

type SaveContentPageCompensation = { id: string; previous: Previous | null };

const saveContentPageStep = createStep(
  "save-content-page",
  async (input: SaveContentPageInput, { container }) => {
    const contentPage =
      container.resolve<ContentPageModuleService>(CONTENT_PAGE_MODULE);
    const [existing] = await contentPage.listContentPages(
      { slug: input.slug },
      { take: 1 },
    );
    const saved = existing
      ? await contentPage.updateContentPages({ id: existing.id, ...input })
      : await contentPage.createContentPages(input);

    return new StepResponse(saved, {
      id: saved.id,
      previous: existing ?? null,
    } satisfies SaveContentPageCompensation);
  },
  async (data: SaveContentPageCompensation | undefined, { container }) => {
    if (!data) return;

    const contentPage =
      container.resolve<ContentPageModuleService>(CONTENT_PAGE_MODULE);

    if (data.previous) {
      const { description, body } = data.previous;

      await contentPage.updateContentPages({
        id: data.id,
        description,
        body,
      });
    } else {
      await contentPage.deleteContentPages(data.id);
    }
  },
);

export const saveContentPageWorkflow = createWorkflow(
  "save-content-page",
  (input: SaveContentPageInput) =>
    new WorkflowResponse(saveContentPageStep(input)),
);
