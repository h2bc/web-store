import { zodResolver } from "@hookform/resolvers/zod";
import { Form, KeyboundForm } from "@medusajs/dashboard/components";
import { Button, Drawer, Input, toast } from "@medusajs/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSaveGallery, Video, VideoInput, withVideo } from "../lib/gallery";

export type DrawerState = { video?: Video } | null;

type VideoDrawerProps = {
  state: DrawerState;
  videos: Video[];
  onClose: () => void;
};

const YOUTUBE_LINK =
  /^https:\/\/(www\.youtube\.com\/watch\?v=|www\.youtube\.com\/embed\/|youtu\.be\/)[\w-]{11}([?&].*)?$/;

const VideoSchema = z.object({
  url: z
    .string()
    .min(1, "Paste a YouTube link")
    .regex(YOUTUBE_LINK, "This is not a YouTube video link"),
  title: z.string().min(1, "Give the video a title").max(120),
});

const EMPTY: VideoInput = { url: "", title: "" };

function toForm(video?: Video): VideoInput {
  return video ? { url: video.url, title: video.title } : EMPTY;
}

export function VideoDrawer({ state, videos, onClose }: VideoDrawerProps) {
  const { mutate, isPending: saving } = useSaveGallery();
  const form = useForm<VideoInput>({
    defaultValues: EMPTY,
    resolver: zodResolver(VideoSchema),
  });

  useEffect(() => {
    if (state) form.reset(toForm(state.video));
  }, [state, form]);

  const submit = form.handleSubmit((values) => {
    const id = state?.video?.id;

    mutate(withVideo(videos, values, id), {
      onSuccess: () => {
        toast.success(id ? "Video updated" : "Video created");
        onClose();
      },
      onError: (error) => toast.error(error.message),
    });
  });

  return (
    <Drawer open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Content>
        <Form {...form}>
          <KeyboundForm className="flex h-full flex-col" onSubmit={submit}>
            <Drawer.Header>
              <Drawer.Title>
                {state?.video ? "Edit video" : "Add video"}
              </Drawer.Title>
              <Drawer.Description>
                Paste a YouTube link and give it a title.
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-y-6">
              <Form.Field
                control={form.control}
                name="url"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>YouTube link</Form.Label>
                    <Form.Control>
                      <Input placeholder="https://youtu.be/..." {...field} />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
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
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="secondary" size="small" type="button">
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
