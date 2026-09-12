import { sdk } from "./sdk";

export type Video = { id: string; url: string; title: string };

export type VideoInput = { url: string; title: string };

const toInput = ({ url, title }: Video): VideoInput => ({ url, title });

export async function loadGallery(): Promise<Video[]> {
  const { videos } = await sdk.client.fetch<{ videos: Video[] }>(
    "/admin/gallery",
  );

  return videos;
}

export async function saveGallery(videos: VideoInput[]): Promise<Video[]> {
  const response = await sdk.client.fetch<{ videos: Video[] }>(
    "/admin/gallery",
    {
      method: "POST",
      body: { videos },
    },
  );

  return response.videos;
}

export function withVideo(
  videos: Video[],
  input: VideoInput,
  id?: string,
): VideoInput[] {
  const inputs = videos.map(toInput);

  if (!id) return [...inputs, input];

  return videos.map((video) => (video.id === id ? input : toInput(video)));
}

export function withoutVideo(videos: Video[], id: string): VideoInput[] {
  return videos.filter((video) => video.id !== id).map(toInput);
}

export function reordered(
  videos: Video[],
  fromId: string,
  toId: string,
): Video[] {
  const ids = videos.map((video) => video.id);
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  const rest = videos.filter((video) => video.id !== fromId);

  return [...rest.slice(0, to), videos[from], ...rest.slice(to)];
}
