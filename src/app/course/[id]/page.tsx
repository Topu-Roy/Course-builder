import { Suspense } from "react";
import { api } from "@/trpc/server";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseBanner } from "@/components/course-banner";
import { CourseThumbnail } from "@/components/course-thumbnail";
import { Navbar } from "@/components/navbar";

export default async function CoursePage(props: PageProps<"/course/[id]">) {
  return (
    <>
      <Navbar />
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
    <div className="container mx-auto max-w-4xl px-4 py-10 lg:px-2 2xl:px-0">
      <CourseBanner courseId={course.id} bannerUrl={course.bannerUrl} isCreator={isCreator} />

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex justify-center md:block">
          <CourseThumbnail courseId={course.id} imageUrl={course.imageUrl} isCreator={isCreator} />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 text-center md:text-left">
              <h1 className="mb-2 text-2xl font-bold md:text-3xl lg:text-4xl">{course.title}</h1>
              <p className="text-muted-foreground line-clamp-2 text-sm md:text-base">{course.description}</p>
            </div>
            {isCreator && (
              <Link href={`/course/${course.id}/edit`} className="mx-auto shrink-0 md:mx-0">
                <Button variant="outline" size="sm" className="w-full md:w-auto">
                  Edit Course
                </Button>
              </Link>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t pt-4 md:justify-start">
            <div className="flex items-center gap-2">
              <Avatar className="size-8 border">
                <AvatarImage src={course.creator.image ?? ""} alt={course.creator.name} />
                <AvatarFallback>{course.creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{course.creator.name}</p>
            </div>
            <div className="text-muted-foreground hidden h-4 border-r md:block" />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:justify-start">
              <p className="text-xs whitespace-nowrap">
                <span className="font-semibold">Created:</span> {new Date(course.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs whitespace-nowrap">
                <span className="font-semibold">Updated:</span> {new Date(course.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List */}
      <div className="grid gap-4">
        {course.chapters.map((chapter) => {
          const isCompleted = chapter.userProgress.some((p) => p.completed && p.chapter.id === chapter.id);

          return (
            <Card key={chapter.id} className="gap-2!">
              <Link href={`/course/${course.id}/chapter/${chapter.id}/view`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 hover:underline">
                  <CardTitle className="font-medium md:text-lg">{chapter.title}</CardTitle>
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
                    <AccordionTrigger className="pb-0">Lessons ({chapter.blocks.length})</AccordionTrigger>
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
    <div className="container mx-auto max-w-4xl px-4 py-10 lg:px-2 2xl:px-0">
      {/* Course Banner Skeleton */}
      <Skeleton className="mb-8 aspect-[2.5/1] w-full rounded-xl md:aspect-4/1" />

      {/* Course Header Skeleton */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex justify-center md:block">
          <Skeleton className="aspect-square w-28 rounded-xl md:w-40" />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1 space-y-2 text-center md:text-left">
              <Skeleton className="mx-auto h-10 w-[250px] md:mx-0 md:w-[300px]" />
              <Skeleton className="mx-auto h-6 w-full max-w-[500px] md:mx-0" />
            </div>
            <Skeleton className="mx-auto h-8 w-[100px] md:mx-0" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 border-t pt-4 md:justify-start">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="hidden h-4 border-r md:block" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
        </div>
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
