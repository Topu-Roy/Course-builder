"use client";

import { Chapter } from "@/generated/prisma/client";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { GripVertical, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteChapter, reorderChapters } from "@/server/actions/chapter";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ChaptersListProps {
  courseId: string;
  chapters: Chapter[];
}

interface SortableChapterProps {
  chapter: Chapter;
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
        "flex items-center gap-x-2 bg-slate-100 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm p-3 relative"
      )}
    >
      <div
        className={cn(
          "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-200 rounded-l-md mr-2 cursor-grab active:cursor-grabbing"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <div className="font-medium truncate">{chapter.title}</div>

      <div className="ml-auto pr-2 flex items-center gap-x-2">
        <Link href={`/course/${courseId}/chapter/${chapter.id}/edit`}>
          <Button size="sm" variant="ghost">
            <Pencil className="h-4 w-4 mr-2" />
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
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<Chapter[]>(chapters);
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
    startTransition(async () => {
      try {
        const updateList = items.map((chapter, index) => ({
          id: chapter.id,
          order: index,
        }));
        await reorderChapters(updateList);
        toast.success("Chapters reordered");
        router.refresh();
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  const onDelete = async (chapterId: string) => {
    try {
      setDeletingId(chapterId);
      await deleteChapter(chapterId);
      toast.success("Chapter deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // Check if order changed
  const isDirty = JSON.stringify(items.map((c) => c.id)) !== JSON.stringify(chapters.map((c) => c.id));

  return (
    <div className="space-y-4">
      {isDirty && (
        <div className="flex items-center justify-between p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800 mb-4">
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
        <div className="text-center text-sm text-muted-foreground mt-10">
          No chapters yet. Click &quot;Add Chapter&quot; above.
        </div>
      )}
    </div>
  );
};
