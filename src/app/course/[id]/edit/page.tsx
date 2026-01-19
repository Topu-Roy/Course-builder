import { api } from "@/trpc/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChaptersList } from "@/components/chapters-list";
import { CourseEditor } from "@/components/course-editor";

export default async function CourseEditPage({ params }: PageProps<"/course/[id]/edit">) {
  // Await params first (Next.js 15+ requirement)
  const { id } = await params;

  const course = await api.course.get({ courseId: id });
  if (!course) notFound();

  return (
    <div className="container mx-auto max-w-4xl py-10">
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
