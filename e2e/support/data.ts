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

export const PUBLIC_PATHS = ["/", "/shop", "/gallery", "/about", "/contact", "/shipping-returns"];
export const PRIVATE_PREFIXES = ["/cart", "/checkout", "/order"];
