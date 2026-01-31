import { Suspense } from "react";
import { type CourseCategory } from "@/generated/prisma/client";
import { api } from "@/trpc/server";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/course-card";
import { CourseFilter } from "@/components/course-filter";
import { Navbar } from "@/components/navbar";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Explore courses</h1>
            <p className="text-muted-foreground mt-2">
              Discover AI-generated masterclasses across various categories.
            </p>
          </div>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center md:w-auto">
            <Suspense fallback={<Skeleton className="h-10 w-full sm:w-[200px]" />}>
              <CourseFilter />
            </Suspense>
            <Link href="/create" className="w-full sm:w-auto">
              <Button className="w-full shadow-sm sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        <Suspense fallback={<CourseGridSkeleton />}>
          <CourseCards searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function CourseCards({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await searchParams;

  const courses = await api.course.getAll({
    category: category as CourseCategory | undefined,
  });

  return (
    <>
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-900">
            <PlusCircle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">No courses found</h2>
          <p className="text-muted-foreground mb-10 max-w-sm">
            We couldn&apos;t find any courses matching your selection. Try a different category or create your own.
          </p>
          <Link href="/create">
            <Button size="lg" className="px-8 shadow-sm">
              Create your first course
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </>
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex h-full flex-col shadow-none">
          <CardHeader className="space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>

          <CardContent className="grow pt-4">
            <Skeleton className="h-4 w-24" />
          </CardContent>

          <CardFooter className="pt-0">
            <Skeleton className="h-11 w-full rounded-xl" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
