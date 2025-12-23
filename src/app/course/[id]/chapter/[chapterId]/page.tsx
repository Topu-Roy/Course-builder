import { db } from "@/server/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { revalidatePath } from "next/cache";
import { CodeBlock } from "@/components/ui/code-block";
import { YouTubeEmbed } from "@/components/ui/youtube-embed";
import { ChapterSidebar } from "@/components/chapter-sidebar";

interface ContentSection {
  heading?: string;
  subHeading?: string;
  imageUrl?: string;
  videoUrl?: string;
  text?: string;
  code?: string;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
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
      <div className="hidden lg:block w-80 fixed inset-y-0 z-50">
        <ChapterSidebar courseId={course.id} chapters={course.chapters} currentChapterId={chapter.id} />
      </div>
      <div className="flex-1 lg:pl-80 pt-[80px]">
        <div className="container mx-auto py-10 max-w-4xl">
          <div className="mb-8">
            <Link href={`/course/${id}`} className="text-sm text-muted-foreground hover:underline mb-4 block">
              &larr; Back to Course
            </Link>
            <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-10">
            {Array.isArray(chapter.content) &&
              (chapter.content as ContentSection[]).map((section, index) => (
                <div key={index} className="mb-8">
                  {section.heading && <h2 className="text-2xl font-bold mb-2">{section.heading}</h2>}
                  {section.subHeading && (
                    <h3 className="text-xl font-semibold mb-3 text-muted-foreground">{section.subHeading}</h3>
                  )}
                  {section.text && <p className="mb-4 leading-relaxed">{section.text}</p>}
                  {section.code && (
                    <div className="mb-4">
                      <CodeBlock code={section.code} language="typescript" />
                    </div>
                  )}
                  {section.imageUrl && (
                    <div className="relative w-full h-96 my-4">
                      <Image
                        src={section.imageUrl}
                        alt={section.heading || "Content image"}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {section.videoUrl && <YouTubeEmbed url={section.videoUrl} />}
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
