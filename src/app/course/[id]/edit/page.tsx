import { Suspense } from "react";
import { api } from "@/trpc/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ChaptersList } from "@/components/chapters-list";
import { CourseEditor } from "@/components/course-editor";

export default async function CourseEditPage({ params }: PageProps<"/course/[id]/edit">) {
  return (
    <Suspense fallback={<CourseEditSkeleton />}>
      <CourseEdit params={params} />
    </Suspense>
  );
}

async function CourseEdit({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const course = await api.course.get({ courseId: id });
  if (!course) notFound();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 lg:px-2 2xl:px-0">
      <Link
        href={`/course/${course.id}`}
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center text-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Link>

      <CourseEditor course={course} />

      <div className="mt-8">
        <ChaptersList courseId={course.id} chapters={course.chapters} />
      </div>
    </div>
  );
}

function CourseEditSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 lg:px-2 2xl:px-0">
      <div className="mb-6">
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
