import { EllipsisHorizontal, PencilSquare } from "@medusajs/icons";
import {
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  Text,
  toast,
} from "@medusajs/ui";
import { ReactNode, useEffect, useMemo, useState } from "react";

import {
  ContentPage,
  ContentPageInput,
  ContentPageSlug,
  loadContentPage,
  saveContentPage,
} from "../lib/content-page";
import { getErrorMessage } from "../lib/sdk";
import { ContentPageDrawer } from "./content-page-drawer";
import { Markdown } from "./markdown";

type ContentCardProps = { slug: ContentPageSlug; label: string };

const EMPTY: ContentPageInput = { description: "", body: "" };

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="text-ui-fg-subtle grid w-full grid-cols-2 items-start gap-4 px-6 py-4">
      <Text size="small" weight="plus" leading="compact">
        {title}
      </Text>
      <div className="text-pretty">{children}</div>
    </div>
  );
}

export function ContentPageCard({ slug, label }: ContentCardProps) {
  const [contentPage, setContentPage] = useState<ContentPage | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContentPage(slug)
      .then(setContentPage)
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoaded(true));
  }, [slug]);

  const input = useMemo(
    () =>
      contentPage
        ? { description: contentPage.description, body: contentPage.body }
        : EMPTY,
    [contentPage],
  );

  const save = async (next: ContentPageInput) => {
    setSaving(true);

    try {
      setContentPage(await saveContentPage(slug, next));
      setEditing(false);
      toast.success("Saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{label}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Shown at /{slug} on the storefront.
          </Text>
        </div>
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <IconButton variant="transparent" size="small" aria-label="Actions">
              <EllipsisHorizontal />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              className="gap-x-2"
              onClick={() => setEditing(true)}
            >
              <PencilSquare className="text-ui-fg-subtle" />
              Edit
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      {contentPage ? (
        <>
          <Row title="Meta description">
            <Text size="small" leading="compact">
              {contentPage.description || "-"}
            </Text>
          </Row>
          <Row title="Body">
            <Markdown>{contentPage.body}</Markdown>
          </Row>
        </>
      ) : (
        <div className="flex flex-col items-center gap-y-2 px-6 py-16">
          <Text weight="plus">No content yet</Text>
          <Text className="text-ui-fg-subtle" size="small">
            Run the seed, or write it here with Edit.
          </Text>
        </div>
      )}
      <ContentPageDrawer
        open={editing}
        label={label}
        contentPage={input}
        saving={saving}
        onClose={() => setEditing(false)}
        onSave={save}
      />
    </Container>
  );
}
