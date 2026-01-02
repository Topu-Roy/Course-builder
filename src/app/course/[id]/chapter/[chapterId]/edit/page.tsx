import { db } from "@/server/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterContentEditor } from "@/components/chapter-content-editor";

interface ChapterEditPageProps {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}

export default async function ChapterEditPage({ params }: ChapterEditPageProps) {
  const { id, chapterId } = await params;

  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId,
      courseId: id,
    },
  });

  if (!chapter) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-6">
        <Link
          href={`/course/${id}/edit`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Editing
        </Link>
      </div>

      <ChapterContentEditor chapterId={chapter.id} initialTitle={chapter.title} initialContent={chapter.content} />
    </div>
  );
}
