import {
  ActionMenu,
  NoRecords,
  SectionRow,
} from "@medusajs/dashboard/components";
import { PencilSquare } from "@medusajs/icons";
import { Container, Heading, Text } from "@medusajs/ui";
import { useState } from "react";

import {
  ContentPage,
  ContentPageInput,
  ContentPageSlug,
  useContentPage,
} from "../lib/content-page";
import { ContentPageDrawer } from "./content-page-drawer";
import { Markdown } from "./markdown";

type ContentCardProps = { slug: ContentPageSlug; label: string };

const EMPTY: ContentPageInput = { title: "", description: "", body: "" };

const toInput = ({
  title,
  description,
  body,
}: ContentPage): ContentPageInput => ({
  title: title ?? "",
  description,
  body,
});

export function ContentPageCard({ slug, label }: ContentCardProps) {
  const [editing, setEditing] = useState(false);
  const { data: contentPage, isPending, error } = useContentPage(slug);

  if (error) throw error;

  if (isPending) return null;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{label}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Shown at /{slug} on the storefront.
          </Text>
        </div>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  onClick: () => setEditing(true),
                },
              ],
            },
          ]}
        />
      </div>
      {contentPage ? (
        <>
          <SectionRow title="Title" value={contentPage.title || "-"} />
          <SectionRow
            title="Meta description"
            value={contentPage.description || "-"}
          />
          <SectionRow
            title="Body"
            value={<Markdown>{contentPage.body}</Markdown>}
          />
        </>
      ) : (
        <NoRecords
          className="h-auto py-16"
          title="No content yet"
          message="Run the seed, or write it here with Edit."
        />
      )}
      <ContentPageDrawer
        open={editing}
        slug={slug}
        label={label}
        contentPage={contentPage ? toInput(contentPage) : EMPTY}
        onClose={() => setEditing(false)}
      />
    </Container>
  );
}
