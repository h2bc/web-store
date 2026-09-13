import { MedusaError, MedusaService } from "@medusajs/framework/utils";

import { ContentPage } from "./models/content-page";
import { ContentPageSlug } from "./types";

export type ContentPageItem = {
  slug: ContentPageSlug;
  title: string | null;
  description: string;
  body: string;
  updated_at: Date;
};

class ContentPageModuleService extends MedusaService({ ContentPage }) {
  async retrieveBySlug(slug: ContentPageSlug): Promise<ContentPageItem> {
    const [contentPage] = await this.listContentPages({ slug }, { take: 1 });

    if (!contentPage) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `${slug} has no content yet`,
      );
    }

    const { title, description, body, updated_at } = contentPage;

    return { slug, title, description, body, updated_at };
  }
}

export default ContentPageModuleService;
