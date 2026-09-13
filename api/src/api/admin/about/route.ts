import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { CONTENT_PAGE_MODULE } from "../../../modules/content-page";
import ContentPageModuleService from "../../../modules/content-page/service";
import { saveContentPageWorkflow } from "../../../workflows/save-content-page";
import { AdminSaveContentPageType } from "../../utils/validators";

const SLUG = "about";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const contentPage =
    req.scope.resolve<ContentPageModuleService>(CONTENT_PAGE_MODULE);

  res.json({ content_page: await contentPage.retrieveBySlug(SLUG) });
}

export async function POST(
  req: AuthenticatedMedusaRequest<AdminSaveContentPageType>,
  res: MedusaResponse,
) {
  await saveContentPageWorkflow(req.scope).run({
    input: { slug: SLUG, ...req.validatedBody },
  });

  const contentPage =
    req.scope.resolve<ContentPageModuleService>(CONTENT_PAGE_MODULE);

  res.json({ content_page: await contentPage.retrieveBySlug(SLUG) });
}
