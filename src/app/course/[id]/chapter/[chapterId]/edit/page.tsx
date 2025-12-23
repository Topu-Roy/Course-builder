import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { ChapterContentEditor } from "@/components/chapter-content-editor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/course/${id}/edit`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Editing
        </Link>
      </div>

      <ChapterContentEditor
        chapterId={chapter.id}
        initialTitle={chapter.title}
        initialContent={chapter.content}
      />
    </div>
  );
}
