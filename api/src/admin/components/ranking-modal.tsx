import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSix, Spinner } from "@medusajs/icons";
import { clx, FocusModal, IconButton } from "@medusajs/ui";

import { reordered, Video } from "../lib/gallery";

type RankingModalProps = {
  open: boolean;
  videos: Video[];
  saving: boolean;
  onClose: () => void;
  onReorder: (videos: Video[]) => void;
};

function RankingRow({ video }: { video: Video }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: video.id,
  });

  return (
    <li className="-mb-px list-none [&:first-of-type>div]:border-t-0">
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={clx(
          "bg-ui-bg-base transition-fg relative flex items-center gap-x-3 border-y px-6 py-2.5",
          { "bg-ui-bg-base-hover z-[1]": isDragging },
        )}
      >
        <IconButton
          size="small"
          variant="transparent"
          type="button"
          className="cursor-grab"
          aria-label={`Drag ${video.title}`}
          {...attributes}
          {...listeners}
        >
          <DotsSix />
        </IconButton>
        <span className="txt-compact-small truncate">{video.title}</span>
        <span className="txt-compact-small text-ui-fg-muted">{video.url}</span>
      </div>
    </li>
  );
}

export function RankingModal({
  open,
  videos,
  saving,
  onClose,
  onReorder,
}: RankingModalProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const drop = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    onReorder(reordered(videos, String(active.id), String(over.id)));
  };

  return (
    <FocusModal open={open} onOpenChange={(next) => !next && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <div className="sr-only">
            <FocusModal.Title>Edit ranking</FocusModal.Title>
            <FocusModal.Description>
              Drag a video to change its position on the storefront.
            </FocusModal.Description>
          </div>
          <div className="flex items-center justify-end">
            {saving && <Spinner className="animate-spin" />}
          </div>
        </FocusModal.Header>
        <FocusModal.Body className="bg-ui-bg-subtle flex flex-1 flex-col overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={drop}
          >
            <SortableContext
              items={videos.map((video) => video.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul>
                {videos.map((video) => (
                  <RankingRow key={video.id} video={video} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  );
}
