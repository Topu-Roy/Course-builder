"use client";

import { Chapter } from "@/generated/prisma/client";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Pencil, Trash } from "lucide-react";
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

interface ChaptersListProps {
  courseId: string;
  chapters: Chapter[];
}

export const ChaptersList = ({ courseId, chapters }: ChaptersListProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onReorder = async (id: string, direction: "up" | "down") => {
    const currentIndex = chapters.findIndex((c) => c.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const currentChapter = chapters[currentIndex];
    const targetChapter = chapters[targetIndex];

    // Optimistic swap? For simplicity, we just call server action with full reorder list logic or specifically swap these two.
    // However, the action expects a list of {id, order}.
    // Let's build the new list locally then send it.

    // Create a copy and swap
    const newChapters = [...chapters];
    newChapters[currentIndex] = targetChapter;
    newChapters[targetIndex] = currentChapter;

    // Recalculate orders based on new index
    const updateList = newChapters.map((chapter, index) => ({
      id: chapter.id,
      order: index,
    }));

    startTransition(async () => {
      try {
        await reorderChapters(updateList);
        toast.success("Chapters reordered");
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

  return (
    <div className="space-y-4">
      {chapters.map((chapter, index) => (
        <div
          key={chapter.id}
          className={cn(
            "flex items-center gap-x-2 bg-slate-100 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm p-3"
          )}
        >
          <div className="flex flex-col gap-y-1 pr-4 border-r mr-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onReorder(chapter.id, "up")}
              disabled={isPending || index === 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onReorder(chapter.id, "down")}
              disabled={isPending || index === chapters.length - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 font-medium truncate">{chapter.title}</div>

          <div className="ml-auto pr-2 flex items-center gap-x-2">
            <Link href={`/course/${courseId}/chapter/${chapter.id}/edit`}>
              <Button size="sm" variant="ghost">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Content
              </Button>
            </Link>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={isPending || deletingId === chapter.id}>
                  <Trash className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the chapter using a server
                    action.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(chapter.id)}
                    disabled={deletingId === chapter.id}
                  >
                    Confirm Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
      {chapters.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No chapters yet. Click &quot;Add Chapter&quot; above.
        </div>
      )}
    </div>
  );
};
