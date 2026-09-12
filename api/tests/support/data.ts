export const ABOUT = {
  description: "Who we are",
  body: "## Us\n\nStreetwear.",
};

export const ABOUT_UPDATED = {
  ...ABOUT,
  body: "## Us\n\nStill streetwear.",
};

export type Video = { url: string; title: string };

export const VIDEOS: Video[] = [
  { url: "https://youtu.be/srRVUe4_wW4", title: "verkei?" },
  { url: "https://www.youtube.com/watch?v=C8Hkml0CRmo", title: "meduza" },
  { url: "https://www.youtube.com/watch?v=qI8fDbBXW2s", title: "2DRIP" },
];

export const VIMEO_VIDEOS: Video[] = [
  { url: "https://vimeo.com/12345", title: "nope" },
];
