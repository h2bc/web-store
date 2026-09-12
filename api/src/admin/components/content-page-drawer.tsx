import { Button, Drawer, Heading, Label, Textarea } from "@medusajs/ui";
import { useEffect, useState } from "react";

import { ContentPageInput } from "../lib/content-page";

type ContentDrawerProps = {
  open: boolean;
  label: string;
  contentPage: ContentPageInput;
  saving: boolean;
  onClose: () => void;
  onSave: (input: ContentPageInput) => void;
};

export function ContentPageDrawer({
  open,
  label,
  contentPage,
  saving,
  onClose,
  onSave,
}: ContentDrawerProps) {
  const [form, setForm] = useState<ContentPageInput>(contentPage);

  useEffect(() => {
    if (open) setForm(contentPage);
  }, [open, contentPage]);

  const setField = (field: keyof ContentPageInput, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <Drawer.Content>
        <form
          className="flex h-full flex-col overflow-hidden"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
        >
          <Drawer.Header>
            <Drawer.Title asChild>
              <Heading>Edit {label}</Heading>
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              Change the meta description and markdown body.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="content-description" size="small" weight="plus">
                Meta description
              </Label>
              <Textarea
                id="content-description"
                rows={2}
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
              />
            </div>
            <div className="flex flex-1 flex-col gap-y-2">
              <Label htmlFor="content-body" size="small" weight="plus">
                Body
              </Label>
              <Textarea
                id="content-body"
                className="min-h-[360px] flex-1 font-mono"
                value={form.body}
                onChange={(event) => setField("body", event.target.value)}
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button size="small" variant="secondary" type="button">
                Cancel
              </Button>
            </Drawer.Close>
            <Button
              size="small"
              type="submit"
              isLoading={saving}
              disabled={saving}
            >
              Save
            </Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  );
}
