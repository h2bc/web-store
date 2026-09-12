import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";

import { AdminSaveGallery } from "./admin/gallery/validators";
import { AdminSaveContentPage } from "./utils/validators";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/(privacy|terms|shipping-returns|about)",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSaveContentPage)],
    },
    {
      matcher: "/admin/gallery",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSaveGallery)],
    },
  ],
});
