import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import { rateLimit } from "express-rate-limit";

import { AdminSaveGallery } from "./admin/gallery/validators";
import { PostStoreContact } from "./store/contact/validators";
import { AdminSaveContentPage } from "./utils/validators";

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

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
    {
      matcher: "/store/contact",
      method: "POST",
      middlewares: [
        contactRateLimit,
        validateAndTransformBody(PostStoreContact),
      ],
    },
  ],
});
