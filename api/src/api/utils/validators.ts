import { z } from "@medusajs/framework/zod";

export const AdminSaveContentPage = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(300),
  body: z.string().min(1).max(100000),
});

export type AdminSaveContentPageType = z.infer<typeof AdminSaveContentPage>;
