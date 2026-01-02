"use client";

import { useState, useTransition } from "react";
import { createChapter } from "@/server/actions/chapter";
import { deleteCourse, updateCourse } from "@/server/actions/course-mutation";
import { Plus, Save, Trash } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CourseEditorProps {
  course: {
    id: string;
    title: string;
    description: string;
  };
}

export const CourseEditor = ({ course }: CourseEditorProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      try {
        await updateCourse(course.id, { title, description });
        toast.success("Course updated");
        router.refresh();
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      try {
        await deleteCourse(course.id);
        toast.success("Course deleted");
        // Redirect handled in server action
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  const onAddChapter = () => {
    startTransition(async () => {
      try {
        await createChapter(course.id, "New Chapter");
        toast.success("Chapter created");
        router.refresh();
      } catch {
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete this course and all its chapters.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="ghost">Cancel</Button>
                <Button variant="destructive" onClick={onDelete} disabled={isPending}>
                  Confirm Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={onSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground grid gap-4 rounded-lg border p-4 shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="title">Course Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isPending} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chapters</h2>
        <Button onClick={onAddChapter} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Chapter
        </Button>
      </div>
    </div>
  );
};
