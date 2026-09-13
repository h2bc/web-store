import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

const getQueryKey = (slug: ContentPageSlug) => ["content-page", slug];

async function loadContentPage(
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

async function saveContentPage(
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

export function useContentPage(slug: ContentPageSlug) {
  return useQuery({
    queryKey: getQueryKey(slug),
    queryFn: () => loadContentPage(slug),
  });
}

export function useSaveContentPage(slug: ContentPageSlug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ContentPageInput) => saveContentPage(slug, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getQueryKey(slug) }),
  });
}
