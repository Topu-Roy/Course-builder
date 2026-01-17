"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    chapters: { id: string }[];
    isEnrolled: boolean;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const { mutate: enroll } = api.course.enroll.useMutation({
    onSuccess: () => {
      toast.success("Enrolled successfully!");
      router.push(`/course/${course.id}`);
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to enroll");
      setIsPending(false);
    },
  });

  const handleEnroll = () => {
    setIsPending(true);
    enroll({ courseId: course.id });
  };

  return (
    <Card className="flex h-full cursor-pointer flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="line-clamp-2 leading-tight">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="grow">
        <p className="text-muted-foreground text-sm">{course.chapters.length} Chapters</p>
      </CardContent>
      <CardFooter>
        {course.isEnrolled ? (
          <Link href={`/course/${course.id}`} className="w-full">
            <Button className="w-full">Continue</Button>
          </Link>
        ) : (
          <Button className="w-full" onClick={handleEnroll} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              "Enroll"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
