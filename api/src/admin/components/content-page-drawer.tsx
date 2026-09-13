import { zodResolver } from "@hookform/resolvers/zod";
import { Form, KeyboundForm } from "@medusajs/dashboard/components";
import { Button, Drawer, Heading, Input, Textarea, toast } from "@medusajs/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  ContentPageInput,
  ContentPageSlug,
  useSaveContentPage,
} from "../lib/content-page";

type ContentDrawerProps = {
  open: boolean;
  slug: ContentPageSlug;
  label: string;
  contentPage: ContentPageInput;
  onClose: () => void;
};

const ContentPageSchema = z.object({
  title: z.string().max(120, "Keep the title under 120 characters"),
  description: z.string().max(300, "Keep the description under 300 characters"),
  body: z.string().min(1, "Write the body").max(100000),
});

export function ContentPageDrawer({
  open,
  slug,
  label,
  contentPage,
  onClose,
}: ContentDrawerProps) {
  const { mutate, isPending: saving } = useSaveContentPage(slug);
  const form = useForm<ContentPageInput>({
    defaultValues: contentPage,
    resolver: zodResolver(ContentPageSchema),
  });

  useEffect(() => {
    if (open) form.reset(contentPage);
  }, [open, contentPage, form]);

  const submit = form.handleSubmit((values) =>
    mutate(values, {
      onSuccess: () => {
        toast.success("Saved");
        onClose();
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <Drawer.Content>
        <Form {...form}>
          <KeyboundForm
            className="flex h-full flex-col overflow-hidden"
            onSubmit={submit}
          >
            <Drawer.Header>
              <Drawer.Title asChild>
                <Heading>Edit {label}</Heading>
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                Change the title, the meta description and the markdown body.
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-y-8 overflow-y-auto">
              <Form.Field
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Title</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Meta description</Form.Label>
                    <Form.Control>
                      <Textarea rows={2} {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="body"
                render={({ field }) => (
                  <Form.Item className="flex-1">
                    <Form.Label>Body</Form.Label>
                    <Form.Control>
                      <Textarea
                        className="min-h-[360px] flex-1 font-mono"
                        {...field}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
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
          </KeyboundForm>
        </Form>
      </Drawer.Content>
    </Drawer>
  );
}
