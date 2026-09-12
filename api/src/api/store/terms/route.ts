import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { CONTENT_PAGE_MODULE } from "../../../modules/content-page";
import ContentPageModuleService from "../../../modules/content-page/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contentPage =
    req.scope.resolve<ContentPageModuleService>(CONTENT_PAGE_MODULE);

  res.json({ content_page: await contentPage.retrieveBySlug("terms") });
}
