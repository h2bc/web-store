export function getEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${id}`;
}

export function getUrls(response: {
  data: { videos: { url: string }[] };
}): string[] {
  return response.data.videos.map((video) => video.url);
}
