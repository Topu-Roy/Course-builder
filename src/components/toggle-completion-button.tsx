"use client";

import { api } from "@/trpc/react";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ToggleCompletionButtonProps {
  courseId: string;
  chapterId: string;
  isCompleted: boolean;
  nextChapterId?: string;
}

export function ToggleCompletionButton({
  courseId,
  chapterId,
  isCompleted,
  nextChapterId,
}: ToggleCompletionButtonProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const { mutate: updateProgress, isPending } = api.course.updateProgress.useMutation({
    onSuccess: (data) => {
      // Invalidate queries to ensure UI is fresh
      void utils.course.getSidebarData.invalidate({ courseId });
      void utils.course.getChapter.invalidate({ chapterId });

      router.refresh();

      if (data.completed && nextChapterId) {
        router.push(`/course/${courseId}/chapter/${nextChapterId}`);
      }

      toast.success(data.completed ? "Chapter completed!" : "Progress reset");
    },
    onError: (error) => {
      toast.error("Something went wrong", {
        description: error.message,
      });
    },
  });

  const handleToggle = () => {
    if (isCompleted && nextChapterId) {
      router.push(`/course/${courseId}/chapter/${nextChapterId}`);
      return;
    }

    const newProgress = isCompleted ? 0 : 100;
    updateProgress({
      chapterId,
      progress: newProgress,
    });
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending || (isCompleted && !nextChapterId)}
      variant={isCompleted ? (nextChapterId ? "outline" : "secondary") : "default"}
      className="min-w-[200px]"
    >
      {isPending ? (
        "Updating..."
      ) : isCompleted ? (
        nextChapterId ? (
          <>
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
          </>
        )
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          {nextChapterId ? "Complete and Continue" : "Mark as Completed"}
          {nextChapterId && <ChevronRight className="ml-2 h-4 w-4" />}
        </>
      )}
    </Button>
  );
}
