import { Suspense } from "react";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { ToggleCompletionButton } from "@/components/toggle-completion-button";
import { UserAvatar } from "@/components/user-avatar";
import { getServerSession } from "@/lib/auth";
import { type ContentBlock } from "@/lib/types";

export default function Page({ params }: PageProps<"/course/[id]/chapter/[chapterId]/view">) {
  return (
    <>
      <Suspense fallback={<ChapterSkeleton />}>
        <Chapter params={params} />
      </Suspense>
    </>
  );
}

async function Chapter({
  params,
}: {
  params: Promise<{
    id: string;
    chapterId: string;
  }>;
}) {
  const { id, chapterId } = await params;

  const [session, chapter, sidebarData] = await Promise.all([
    getServerSession(),
    api.course.getChapter({ chapterId, courseId: id }),
    api.course.getSidebarData({ courseId: id }),
  ]);

  if (!session) redirect("/auth/sign-in");
  if (!chapter) notFound();

  const { course } = chapter;
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
      <header className="bg-background border-border sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b pr-4">
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
        <div className="container mx-auto max-w-4xl px-4 py-10 lg:px-2 2xl:px-0">
          {/* Header */}
          <div className="mb-8">
            <Link href={`/course/${id}`} className="text-muted-foreground mb-4 block text-sm hover:underline">
              &larr; Back to Course
            </Link>
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">{chapter.title}</h1>
          </div>

          {/* Content */}
          <div className="prose dark:prose-invert mb-10 max-w-none">
            <ContentBlockRenderer blocks={contentBlocks as ContentBlock[]} />
          </div>

          {/* Navigation Footer */}
          <div className="flex w-full flex-col-reverse items-center justify-between gap-4 border-t pt-6 md:flex-row">
            <div>
              {prevChapter && (
                <Link href={`/course/${id}/chapter/${prevChapter.id}/view`}>
                  <Button variant="outline">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous: {prevChapter.title}
                  </Button>
                </Link>
              )}
            </div>
            <ToggleCompletionButton courseId={id} chapterId={chapterId} nextChapterId={nextChapter?.id} />
          </div>
        </div>
      </div>
    </>
  );
}

function ChapterSkeleton() {
  return (
    <>
      <header className="bg-background border-border sticky top-0 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b px-4">
        <div className="flex items-center gap-2">
          {/* Menu Button Placeholder */}
          <Skeleton className="h-8 w-8 rounded-md" />

          <div className="bg-border h-4 w-px" />

          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-2">
            <Skeleton className="hidden h-4 w-[100px] md:block" />
            <Skeleton className="hidden h-4 w-4 md:block" />
            <Skeleton className="h-4 w-[140px]" />
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="pr-4">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="container mx-auto max-w-4xl py-10">
          {/* Breadcrumb Back */}
          <div className="mb-8">
            <Skeleton className="text-muted-foreground mb-4 h-4 w-[120px]" />
            <Skeleton className="h-9 w-[70%]" />
          </div>

          {/* Prose Content Placeholder */}
          <div className="prose dark:prose-invert mb-10 max-w-none space-y-6">
            {/* Multiple content sections */}
            {[1, 2, 3].map((section) => (
              <div key={section} className="space-y-3">
                <Skeleton className="h-6 w-[40%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[96%]" />
                <Skeleton className="h-4 w-[92%]" />
              </div>
            ))}

            {/* Code block or media placeholder */}
            <Skeleton className="h-32 w-full rounded-lg" />

            {/* More text */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[85%]" />
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="border-border flex items-center justify-between border-t pt-6">
            <Skeleton className="h-10 w-[160px] rounded-md" />
            <Skeleton className="h-10 w-[180px] rounded-md" />
          </div>
        </div>
      </div>
    </>
  );
}
