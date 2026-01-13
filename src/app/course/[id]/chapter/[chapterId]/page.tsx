import { db } from "@/server/db";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChapterSidebar } from "@/components/chapter-sidebar";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { ToggleCompletionButton } from "@/components/toggle-completion-button";
import { type ContentBlock } from "@/lib/types";

interface ChapterPageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id, chapterId } = await params;

  // Single query that gets all needed data including blocks
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
      course: {
        include: {
          chapters: {
            orderBy: { order: "asc" },
          },
        },
      },
      userProgress: true,
    },
  });

  if (!chapter) {
    notFound();
  }

  const { course } = chapter;
  const isCompleted = chapter.userProgress.some((p) => p.completed);
  const currentChapterIndex = course.chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = course.chapters[currentChapterIndex - 1];
  const nextChapter = course.chapters[currentChapterIndex + 1];

  // Transform blocks to ContentBlock format for the renderer
  const contentBlocks: ContentBlock[] = chapter.blocks.map((block) => ({
    id: block.id,
    type: block.type as ContentBlock["type"],
    content: block.content,
    metadata: block.metadata as ContentBlock["metadata"],
  }));

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="fixed inset-y-0 z-50 hidden w-80 lg:block">
        <ChapterSidebar courseId={course.id} chapters={course.chapters} currentChapterId={chapter.id} />
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-[80px] lg:pl-80">
        <div className="container mx-auto max-w-4xl py-10">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/course/${id}`} className="text-muted-foreground mb-4 block text-sm hover:underline">
              &larr; Back to Course
            </Link>
            <h1 className="mb-2 text-3xl font-bold">{chapter.title}</h1>
          </div>

          {/* Content */}
          <div className="prose dark:prose-invert mb-10 max-w-none">
            <ContentBlockRenderer blocks={contentBlocks} />
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between border-t pt-6">
            <div>
              {prevChapter && (
                <Link href={`/course/${id}/chapter/${prevChapter.id}`}>
                  <Button variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous: {prevChapter.title}
                  </Button>
                </Link>
              )}
            </div>

            <ToggleCompletionButton courseId={id} chapterId={chapterId} isCompleted={isCompleted} />

            <div>
              {nextChapter && (
                <Link href={`/course/${id}/chapter/${nextChapter.id}`}>
                  <Button variant="outline">
                    Next: {nextChapter.title}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
