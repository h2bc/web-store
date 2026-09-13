import type { APIRequestContext } from "@playwright/test";
import { API_URL } from "./data";

export type VideoInput = { url: string; title: string };

type Video = VideoInput & { id: string };

export async function getGalleryVideos(request: APIRequestContext): Promise<VideoInput[]> {
  const response = await request.get(`${API_URL}/admin/gallery`);
  const { videos } = (await response.json()) as { videos: Video[] };

  return videos.map(({ url, title }) => ({ url, title }));
}

export async function saveGalleryVideos(request: APIRequestContext, videos: VideoInput[]) {
  const response = await request.post(`${API_URL}/admin/gallery`, { data: { videos } });

  if (!response.ok()) throw new Error(`Saving the gallery answered ${response.status()}`);
}
