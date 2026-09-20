export const ABOUT = {
  title: "About us",
  description: "Who we are",
  body: "## Us\n\nStreetwear.",
};

export const ABOUT_UPDATED = {
  ...ABOUT,
  body: "## Us\n\nStill streetwear.",
};

export const ABOUT_UNTITLED = { ...ABOUT, title: "" };

export type Video = { url: string; title: string };

export const VIDEOS: Video[] = [
  { url: "https://youtu.be/srRVUe4_wW4", title: "verkei?" },
  { url: "https://www.youtube.com/watch?v=C8Hkml0CRmo", title: "meduza" },
  { url: "https://www.youtube.com/watch?v=qI8fDbBXW2s", title: "2DRIP" },
];

export const VIMEO_VIDEOS: Video[] = [
  { url: "https://vimeo.com/12345", title: "nope" },
];

export const TRACKED_ORDER = {
  id: "order_tracked",
  display_id: 7,
  email: "Buyer@Example.com",
  currency_code: "eur",
  total: 59.9,
  metadata: { analytics_consent: true },
  shipping_address: {
    first_name: "Jonas",
    last_name: "Jonaitis",
    country_code: "lt",
  },
  items: [
    {
      product_id: "prod_beanie",
      variant_id: "variant_black",
      product_title: "Beanie",
      variant_title: "Black",
      quantity: 1,
      unit_price: 24.95,
    },
    {
      product_id: "prod_belt",
      variant_id: "variant_m",
      product_title: "Belt",
      variant_title: "M",
      quantity: 1,
      unit_price: 34.95,
    },
  ],
};

export const UNCONSENTED_ORDER = { ...TRACKED_ORDER, metadata: null };

export const PERSONAL_FIELDS = ["email", "name", "$set"];

export const REFUND = { refunded_amount: 24.95 };
