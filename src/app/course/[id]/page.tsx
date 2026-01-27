import { Suspense } from "react";
import { api } from "@/trpc/server";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default async function CoursePage(props: PageProps<"/course/[id]">) {
  return (
    <>
      <Suspense fallback={<CourseSkeleton />}>
        <Course params={props.params} />
      </Suspense>
    </>
  );
}

async function Course({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const data = await api.course.getCourseChapters({ courseId: id });
  if (!data.course) notFound();

  const { course, isCreator } = data;

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-4 px-2 md:hidden">
        <SidebarTrigger />
      </div>
      {/* Course Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-4 text-4xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground line-clamp-3 text-lg">{course.description}</p>
        </div>
        {isCreator ? (
          <Link href={`/course/${course.id}/edit`} className="w-full md:w-auto">
            <Button variant="outline" className="w-full md:w-auto">
              Edit Course
            </Button>
          </Link>
        ) : null}
      </div>

      {/* Chapter List */}
      <div className="grid gap-4">
        {course.chapters.map((chapter) => {
          const isCompleted = chapter.userProgress.some((p) => p.completed && p.chapter.id === chapter.id);

          return (
            <Card key={chapter.id}>
              <Link href={`/course/${course.id}/chapter/${chapter.id}/view`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 hover:underline">
                  <CardTitle className="text-xl font-medium">{chapter.title}</CardTitle>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="text-muted-foreground h-6 w-6" />
                  )}
                </CardHeader>
              </Link>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={chapter.title}>
                    <AccordionTrigger>Lessons ({chapter.blocks.length})</AccordionTrigger>
                    {chapter.blocks.map((block) => (
                      <AccordionContent key={block.id}>{block.content}</AccordionContent>
                    ))}
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-10">
      {/* Course Header Skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-4">
          <Skeleton className="h-10 w-[400px]" />
          <Skeleton className="h-6 w-[600px]" />
        </div>
        <Button variant="outline" disabled>
          <Skeleton className="h-4 w-[80px]" />
        </Button>
      </div>

      {/* Chapter List Skeleton */}
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="pointer-events-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-6 w-[250px]" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
