import { z } from "@medusajs/framework/zod";

const WATCH_LINK = "https://www.youtube.com/watch?v=";
const SHARE_LINK = "https://youtu.be/";
const EMBED_LINK = "https://www.youtube.com/embed/";

function isVideoLink(link: string): boolean {
  return [WATCH_LINK, SHARE_LINK, EMBED_LINK].some((prefix) =>
    link.startsWith(prefix),
  );
}

function getVideoId(link: string): string {
  const url = new URL(link);

  return url.searchParams.get("v") ?? url.pathname.split("/").pop()!;
}

const YoutubeVideoLink = z
  .string()
  .refine(
    (link) => isVideoLink(link) && getVideoId(link).length === 11,
    "url is not a YouTube video link",
  )
  .transform((link) => `https://www.youtube.com/embed/${getVideoId(link)}`);

export const AdminSaveGallery = z.object({
  videos: z
    .array(
      z.object({ url: YoutubeVideoLink, title: z.string().min(1).max(120) }),
    )
    .max(100),
});

export type AdminSaveGalleryType = z.infer<typeof AdminSaveGallery>;
