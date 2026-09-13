import { z } from "@medusajs/framework/zod";

export const PostStoreContact = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  topic: z.string().trim().min(1).max(100),
  message: z.string().trim().min(5).max(5000),
  website: z.string().optional(),
});

export type PostStoreContactType = z.infer<typeof PostStoreContact>;
