export const SITE_URL = "http://localhost:3000";
export const API_URL = "http://localhost:9000";
export const TEST_ADMIN = { email: "admin@h2bc.local", password: "admin-pass" };

export const EMAIL = "e2e@example.com";
export const DECLINED_CARD = "4000000000000002";
export const VALID_CARD = "4242424242424242";

export type Address = { country: string; line1: string; postalCode: string; city: string };

export const LITHUANIAN_ADDRESS: Address = {
  country: "LT",
  line1: "Gedimino pr. 1",
  postalCode: "01103",
  city: "Vilnius",
};

export const GERMAN_ADDRESS: Address = {
  country: "DE",
  line1: "Unter den Linden 1",
  postalCode: "10115",
  city: "Berlin",
};

export const CONTENT_PAGES = [
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/terms", label: "Terms & Conditions" },
  { path: "/shipping-returns", label: "Shipping & Returns" },
  { path: "/about", label: "About" },
];

export const FIRST_GALLERY_VIDEO_ID = "srRVUe4_wW4";

export const PUBLIC_PATHS = [
  "/",
  "/shop",
  "/gallery",
  "/about",
  "/contact",
  "/shipping-returns",
  "/privacy",
  "/terms",
];
export const PRIVATE_PREFIXES = ["/cart", "/checkout", "/order"];

export const ADMIN_SCREENS = ["Gallery", "Privacy Policy", "Terms & Conditions", "Shipping & Returns", "About"];
export const NEW_VIDEO = { id: "dQw4w9WgXcQ", title: "Owner check" };
export const NEW_BODY_TEXT = "Written in the admin.";
export const NEW_BODY = `## Owner check\n\n${NEW_BODY_TEXT}`;
