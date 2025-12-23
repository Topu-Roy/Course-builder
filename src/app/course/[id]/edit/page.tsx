import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { CourseEditor } from "@/components/course-editor";
import { ChaptersList } from "@/components/chapters-list";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CourseEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  // Await params first (Next.js 15+ requirement)
  const { id } = await params;

  const course = await db.course.findUnique({
    where: {
      id: id,
    },
    include: {
      chapters: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Link
        href={`/course/${course.id}`}
        className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
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
