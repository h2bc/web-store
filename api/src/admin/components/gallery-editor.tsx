import { EllipsisHorizontal, PencilSquare, Trash } from "@medusajs/icons";
import {
  Button,
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  Table,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui";
import { useEffect, useState } from "react";

import {
  loadGallery,
  saveGallery,
  Video,
  VideoInput,
  withoutVideo,
  withVideo,
} from "../lib/gallery";
import { getErrorMessage } from "../lib/sdk";
import { RankingModal } from "./ranking-modal";
import { DrawerState, VideoDrawer } from "./video-drawer";

type VideoRowProps = {
  video: Video;
  onEdit: (video: Video) => void;
  onRemove: (video: Video) => void;
};

function VideoRow({ video, onEdit, onRemove }: VideoRowProps) {
  return (
    <Table.Row>
      <Table.Cell className="pl-6">{video.title}</Table.Cell>
      <Table.Cell>{video.url}</Table.Cell>
      <Table.Cell className="w-14 pr-6 text-right">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <IconButton
              variant="transparent"
              size="small"
              aria-label={`Actions for ${video.title}`}
            >
              <EllipsisHorizontal />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              className="gap-x-2"
              onClick={() => onEdit(video)}
            >
              <PencilSquare className="text-ui-fg-subtle" />
              Edit
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className="gap-x-2"
              onClick={() => onRemove(video)}
            >
              <Trash className="text-ui-fg-subtle" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </Table.Cell>
    </Table.Row>
  );
}

export function GalleryEditor() {
  const prompt = usePrompt();
  const [videos, setVideos] = useState<Video[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [ranking, setRanking] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGallery()
      .then(setVideos)
      .catch((error) => toast.error(getErrorMessage(error)));
  }, []);

  const save = async (
    next: VideoInput[],
    success: string,
  ): Promise<string | null> => {
    setSaving(true);

    try {
      setVideos(await saveGallery(next));
      toast.success(success);

      return null;
    } catch (error) {
      return getErrorMessage(error);
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async (input: VideoInput, id?: string) => {
    const error = await save(
      withVideo(videos, input, id),
      id ? "Video updated" : "Video created",
    );

    if (!error) setDrawer(null);

    return error;
  };

  const removeVideo = async (video: Video) => {
    const confirmed = await prompt({
      title: "Delete video",
      description: `Delete "${video.title}" from the gallery?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    const error = await save(withoutVideo(videos, video.id), "Video deleted");

    if (error) toast.error(error);
  };

  const reorder = async (next: Video[]) => {
    const error = await save(
      next.map(({ url, title }) => ({ url, title })),
      "Ranking saved",
    );

    if (error) toast.error(error);
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Gallery</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Videos on the storefront gallery and their ranking.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          {videos.length > 0 && (
            <Button
              size="small"
              variant="secondary"
              onClick={() => setRanking(true)}
            >
              Edit ranking
            </Button>
          )}
          <Button
            size="small"
            variant="secondary"
            onClick={() => setDrawer({})}
          >
            Create
          </Button>
        </div>
      </div>
      {videos.length === 0 ? (
        <div className="flex flex-col items-center gap-y-2 px-6 py-16">
          <Text weight="plus">No videos yet</Text>
          <Text className="text-ui-fg-subtle" size="small">
            Create one to show it on the storefront.
          </Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="pl-6">Title</Table.HeaderCell>
              <Table.HeaderCell>Link</Table.HeaderCell>
              <Table.HeaderCell className="w-14 pr-6" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {videos.map((video) => (
              <VideoRow
                key={video.id}
                video={video}
                onEdit={(item) => setDrawer({ video: item })}
                onRemove={removeVideo}
              />
            ))}
          </Table.Body>
        </Table>
      )}
      <VideoDrawer
        state={drawer}
        saving={saving}
        onClose={() => setDrawer(null)}
        onSave={saveVideo}
      />
      <RankingModal
        open={ranking}
        videos={videos}
        saving={saving}
        onClose={() => setRanking(false)}
        onReorder={reorder}
      />
    </Container>
  );
}
