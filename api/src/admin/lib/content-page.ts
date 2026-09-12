import { sdk } from "./sdk";

export type ContentPageSlug =
  | "privacy"
  | "terms"
  | "shipping-returns"
  | "about";

export type ContentPageInput = {
  title: string;
  description: string;
  body: string;
};

export type ContentPage = Omit<ContentPageInput, "title"> & {
  slug: ContentPageSlug;
  title: string | null;
  updated_at: string;
};

type ContentPageResponse = { content_page: ContentPage };

export async function loadContentPage(
  slug: ContentPageSlug,
): Promise<ContentPage | null> {
  try {
    const { content_page } = await sdk.client.fetch<ContentPageResponse>(
      `/admin/${slug}`,
    );

    return content_page;
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 404)
      return null;

    throw error;
  }
}

export async function saveContentPage(
  slug: ContentPageSlug,
  input: ContentPageInput,
): Promise<ContentPage> {
  const { content_page } = await sdk.client.fetch<ContentPageResponse>(
    `/admin/${slug}`,
    {
      method: "POST",
      body: input,
    },
  );

  return content_page;
}
