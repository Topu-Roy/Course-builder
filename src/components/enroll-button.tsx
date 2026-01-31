"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { mutate: enroll, isPending } = api.course.enroll.useMutation({
    onSuccess: () => {
      toast.success("Enrolled successfully!");
      router.push(`/course/${courseId}`);
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to enroll");
    },
  });

  const handleEnroll = () => {
    enroll({ courseId });
  };

  return (
    <Button
      className="h-11 w-full rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] sm:h-12"
      onClick={handleEnroll}
      disabled={isPending}
    >
      {isPending ? (
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          <span>Enrolling...</span>
        </div>
      ) : (
        "Enroll Now"
      )}
    </Button>
  );
}
