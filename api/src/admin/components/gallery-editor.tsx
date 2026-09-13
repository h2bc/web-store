import { DataTable } from "@medusajs/dashboard/components";
import { PencilSquare, Trash } from "@medusajs/icons";
import { createDataTableColumnHelper, toast, usePrompt } from "@medusajs/ui";
import { useState } from "react";

import {
  useGallery,
  useSaveGallery,
  Video,
  VideoInput,
  withoutVideo,
} from "../lib/gallery";
import { RankingModal } from "./ranking-modal";
import { DrawerState, VideoDrawer } from "./video-drawer";

const columnHelper = createDataTableColumnHelper<Video>();

function getColumns(
  onEdit: (video: Video) => void,
  onRemove: (video: Video) => void,
) {
  return [
    columnHelper.accessor("title", { header: "Title" }),
    columnHelper.accessor("url", { header: "Link" }),
    columnHelper.action({
      actions: [
        [
          {
            label: "Edit",
            icon: <PencilSquare />,
            onClick: ({ row }) => onEdit(row.original),
          },
        ],
        [
          {
            label: "Delete",
            icon: <Trash />,
            onClick: ({ row }) => onRemove(row.original),
          },
        ],
      ],
    }),
  ];
}

const toInputs = (videos: Video[]): VideoInput[] =>
  videos.map(({ url, title }) => ({ url, title }));

export function GalleryEditor() {
  const prompt = usePrompt();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [ranking, setRanking] = useState(false);
  const { data: videos = [], isPending, error } = useGallery();
  const { mutate, isPending: saving } = useSaveGallery();

  if (error) throw error;

  const save = (next: VideoInput[], success: string) =>
    mutate(next, {
      onSuccess: () => toast.success(success),
      onError: (saveError) => toast.error(saveError.message),
    });

  const removeVideo = async (video: Video) => {
    const confirmed = await prompt({
      title: "Delete video",
      description: `Delete "${video.title}" from the gallery?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) save(withoutVideo(videos, video.id), "Video deleted");
  };

  const reorder = (next: Video[]) => save(toInputs(next), "Ranking saved");

  return (
    <>
      <DataTable
        data={videos}
        columns={getColumns((video) => setDrawer({ video }), removeVideo)}
        getRowId={(video) => video.id}
        rowCount={videos.length}
        isLoading={isPending}
        enableSearch={false}
        heading="Gallery"
        subHeading="Videos on the storefront gallery and their ranking."
        actions={[
          {
            label: "Edit ranking",
            disabled: videos.length === 0,
            onClick: () => setRanking(true),
          },
          { label: "Create", onClick: () => setDrawer({}) },
        ]}
        emptyState={{
          empty: {
            heading: "No videos yet",
            description: "Create one to show it on the storefront.",
          },
        }}
      />
      <VideoDrawer
        state={drawer}
        videos={videos}
        onClose={() => setDrawer(null)}
      />
      <RankingModal
        open={ranking}
        videos={videos}
        saving={saving}
        onClose={() => setRanking(false)}
        onReorder={reorder}
      />
    </>
  );
}
