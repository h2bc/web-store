import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";
import { rateLimit } from "express-rate-limit";
import { PostStoreContact } from "./store/contact/validators";

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/contact",
      methods: ["POST"],
      middlewares: [
        contactRateLimit,
        validateAndTransformBody(PostStoreContact),
      ],
    },
  ],
});
