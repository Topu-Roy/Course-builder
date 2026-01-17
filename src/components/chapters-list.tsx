"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ChaptersListProps {
  courseId: string;
  chapters: { id: string; title: string; order: number }[];
}

interface SortableChapterProps {
  chapter: { id: string; title: string; order: number };
  onDelete: (id: string) => void;
  isDeleting: boolean;
  courseId: string;
}

const SortableChapter = ({ chapter, onDelete, isDeleting, courseId }: SortableChapterProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative mb-4 flex items-center gap-x-2 rounded-md border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700"
      )}
    >
      <div
        className={cn(
          "mr-2 cursor-grab rounded-l-md border-r border-r-slate-200 px-2 py-3 hover:bg-slate-200 active:cursor-grabbing"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="truncate font-medium">{chapter.title}</div>

      <div className="ml-auto flex items-center gap-x-2 pr-2">
        <Link href={`/course/${courseId}/chapter/${chapter.id}/edit`}>
          <Button size="sm" variant="ghost">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive" disabled={isDeleting}>
              <Trash className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the chapter using a server action.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive" onClick={() => onDelete(chapter.id)} disabled={isDeleting}>
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export const ChaptersList = ({ courseId, chapters }: ChaptersListProps) => {
  const router = useRouter();
  const { mutate: reorderChapters, isPending: isReorderPending } = api.chapter.reorder.useMutation({
    onSuccess: () => {
      toast.success("Chapters reordered");
      router.refresh();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const { mutate: deleteChapter, isPending: isDeletePending } = api.chapter.delete.useMutation({
    onSuccess: () => {
      toast.success("Chapter deleted");
      router.refresh();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const isPending = isReorderPending || isDeletePending;

  const [items, setItems] = useState<{ id: string; title: string; order: number }[]>(chapters);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync state if props change (unlikely in this flow but good practice)
  useEffect(() => {
    setItems(chapters);
  }, [chapters]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const onSaveOrder = () => {
    const updateList = items.map((chapter, index) => ({
      id: chapter.id,
      order: index,
    }));
    reorderChapters({ list: updateList });
  };

  const onDelete = (chapterId: string) => {
    setDeletingId(chapterId);
    deleteChapter(
      { chapterId },
      {
        onSettled: () => setDeletingId(null),
      }
    );
  };

  // Check if order changed
  const isDirty = JSON.stringify(items.map((c) => c.id)) !== JSON.stringify(chapters.map((c) => c.id));

  return (
    <div className="space-y-4">
      {isDirty && (
        <div className="mb-4 flex items-center justify-between rounded border border-yellow-200 bg-yellow-100 p-2 text-sm text-yellow-800">
          <span>You have unsaved changes to the chapter order.</span>
          <Button size="sm" onClick={onSaveOrder} disabled={isPending}>
            {isPending ? "Saving..." : "Save Order"}
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((chapter) => (
            <SortableChapter
              key={chapter.id}
              chapter={chapter}
              onDelete={onDelete}
              isDeleting={deletingId === chapter.id}
              courseId={courseId}
            />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="text-muted-foreground mt-10 text-center text-sm">
          No chapters yet. Click &quot;Add Chapter&quot; above.
        </div>
      )}
    </div>
  );
};
