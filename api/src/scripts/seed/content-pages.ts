import { faker } from "@faker-js/faker";
import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { CONTENT_PAGE_MODULE } from "../../modules/content-page";
import ContentPageModuleService from "../../modules/content-page/service";
import {
  CONTENT_PAGE_SLUGS,
  ContentPageSlug,
} from "../../modules/content-page/types";

const TITLES: Record<ContentPageSlug, string> = {
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  "shipping-returns": "Shipping & Returns",
  about: "About",
};

function getSection() {
  return `## ${faker.lorem.words(3)}\n\n${faker.lorem.paragraphs(2, "\n\n")}`;
}

function getContentPage(slug: ContentPageSlug) {
  return {
    slug,
    title: TITLES[slug],
    description: faker.lorem.sentence(),
    body: Array.from({ length: 3 }, getSection).join("\n\n"),
  };
}

export default async function seedContentPages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const contentPage =
    container.resolve<ContentPageModuleService>(CONTENT_PAGE_MODULE);
  const existing = new Set(
    (await contentPage.listContentPages({}, { select: ["slug"] })).map(
      (item) => item.slug,
    ),
  );
  const missing = CONTENT_PAGE_SLUGS.filter((slug) => !existing.has(slug));

  logger.info(`Content pages: creating ${missing.join(", ") || "none"}`);
  await contentPage.createContentPages(missing.map(getContentPage));
}
