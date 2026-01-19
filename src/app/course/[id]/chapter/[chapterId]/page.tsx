import { api } from "@/trpc/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { CourseSidebar } from "@/components/course-sidebar";
import { UserAvatar } from "@/components/navbar";
import { ToggleCompletionButton } from "@/components/toggle-completion-button";
import { getServerSession } from "@/lib/auth";
import { type ContentBlock } from "@/lib/types";

export default async function ChapterPage({ params }: PageProps<"/course/[id]/chapter/[chapterId]">) {
  const { id, chapterId } = await params;

  const [session, chapter, sidebarData] = await Promise.all([
    getServerSession(),
    api.course.getChapter({ chapterId }),
    api.course.getSidebarData({ courseId: id }),
  ]);

  if (!session) redirect("/auth/sign-in");
  if (!chapter) notFound();

  const { course } = chapter;
  const isCompleted = chapter.userProgress.some((p) => p.completed);
  const currentChapterIndex = course.chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = course.chapters[currentChapterIndex - 1];
  const nextChapter = course.chapters[currentChapterIndex + 1];

  // Transform blocks to ContentBlock format for the renderer
  const contentBlocks = chapter.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    content: block.content,
    metadata: block.metadata,
  }));

  return (
    <>
      <CourseSidebar
        courseId={course.id}
        chapters={sidebarData.chapters}
        title={sidebarData.title}
        user={session?.user}
      />
      <SidebarInset>
        <header className="bg-background border-border sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/course/${id}`}>{sidebarData.title}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{chapter.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <UserAvatar user={session?.user} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
              <ContentBlockRenderer blocks={contentBlocks as ContentBlock[]} />
            </div>

            {/* Navigation Footer */}
            <div className="flex w-full items-center justify-between border-t pt-6">
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
              <ToggleCompletionButton
                courseId={id}
                chapterId={chapterId}
                isCompleted={isCompleted}
                nextChapterId={nextChapter?.id}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  );
}
