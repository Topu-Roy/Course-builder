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
    <Button className="w-full" onClick={handleEnroll} disabled={isPending}>
      {isPending ? (
        <>
          <Spinner />
          Enrolling...
        </>
      ) : (
        "Enroll"
      )}
    </Button>
  );
}
