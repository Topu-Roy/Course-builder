"use client";

import { useTransition } from "react";
import { toggleChapterCompletion } from "@/server/actions/progress";
import { Button } from "@/components/ui/button";

interface ToggleCompletionButtonProps {
  courseId: string;
  chapterId: string;
  isCompleted: boolean;
}

export function ToggleCompletionButton({ courseId, chapterId, isCompleted }: ToggleCompletionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleChapterCompletion(courseId, chapterId);
    });
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={isCompleted ? "secondary" : "default"}
      className="min-w-[200px]"
    >
      {isPending ? "Updating..." : isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
    </Button>
  );
}
