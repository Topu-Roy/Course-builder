import { db } from "@/server/db";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { ChapterSidebar } from "@/components/chapter-sidebar";
import { type ContentBlock } from "@/lib/types";

export default async function ChapterPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const { id, chapterId } = await params;

  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId,
    },
    include: {
      course: {
        include: {
          chapters: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      userProgress: true,
    },
  });

  if (!chapter) {
    notFound();
  }

  const isCompleted = chapter.userProgress.some((p) => p.completed);
  const currentChapterIndex = chapter.course.chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = chapter.course.chapters[currentChapterIndex - 1];
  const nextChapter = chapter.course.chapters[currentChapterIndex + 1];

  async function toggleCompletion() {
    "use server";

    // Simple user ID for now
    const userId = "user-1";

    const existingProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    if (existingProgress) {
      await db.userProgress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          completed: !existingProgress.completed,
        },
      });
    } else {
      await db.userProgress.create({
        data: {
          userId,
          chapterId,
          completed: true,
        },
      });
    }

    revalidatePath(`/course/${id}`);
    revalidatePath(`/course/${id}/chapter/${chapterId}`);
  }

  // Fetch all chapters for the sidebar
  const course = await db.course.findUnique({
    where: {
      id: chapter.courseId,
    },
    include: {
      chapters: {
        where: {
          courseId: chapter.courseId,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  return (
    <div className="flex h-full">
      <div className="fixed inset-y-0 z-50 hidden w-80 lg:block">
        <ChapterSidebar courseId={course.id} chapters={course.chapters} currentChapterId={chapter.id} />
      </div>
      <div className="flex-1 pt-[80px] lg:pl-80">
        <div className="container mx-auto max-w-4xl py-10">
          <div className="mb-8">
            <Link href={`/course/${id}`} className="text-muted-foreground mb-4 block text-sm hover:underline">
              &larr; Back to Course
            </Link>
            <h1 className="mb-2 text-3xl font-bold">{chapter.title}</h1>
          </div>

          <div className="prose dark:prose-invert mb-10 max-w-none">
            {Array.isArray(chapter.content) &&
              (chapter.content as unknown as ContentBlock[]).map((block) => (
                <div key={block.id} className="mb-6">
                  {block.type === "heading" && <h2 className="mt-6 mb-4 text-2xl font-bold">{block.content}</h2>}

                  {block.type === "text" && <p className="mb-4 leading-relaxed">{block.content}</p>}

                  {block.type === "code" && (
                    <div className="mb-4">
                      <CodeBlock code={block.content} language={block.metadata?.language ?? "typescript"} />
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="relative my-6 h-96 w-full">
                      <Image src={block.content} alt="Content image" fill className="rounded-lg object-cover" />
                    </div>
                  )}

                  {block.type === "video" && <YouTubeEmbed url={block.content} />}
                </div>
              ))}
          </div>

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

            <form action={toggleCompletion}>
              <Button type="submit" variant={isCompleted ? "secondary" : "default"} className="min-w-[200px]">
                {isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
              </Button>
            </form>

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
