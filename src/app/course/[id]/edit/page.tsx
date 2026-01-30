import { Suspense } from "react";
import { api } from "@/trpc/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ChaptersList } from "@/components/chapters-list";
import { CourseEditor } from "@/components/course-editor";
import { Navbar } from "@/components/navbar";

export default async function CourseEditPage({ params }: PageProps<"/course/[id]/edit">) {
  return (
    <>
      <Navbar />
      <Suspense fallback={<CourseEditSkeleton />}>
        <CourseEdit params={params} />
      </Suspense>
    </>
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

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <Skeleton className="aspect-[2.5/1] w-full rounded-xl md:aspect-4/1" />

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex justify-center md:block">
            <Skeleton className="aspect-square w-28 rounded-xl md:w-40" />
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
