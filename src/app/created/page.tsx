import { Suspense } from "react";
import { api } from "@/trpc/server";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/course-card";
import { Navbar } from "@/components/navbar";

export default function CreatedCoursesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Created Courses</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Manage the courses you have built with AI.
            </p>
          </div>
          <Link href="/create">
            <Button size="lg" className="shadow-sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Course</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
        </div>

        <Suspense fallback={<CourseGridSkeleton />}>
          <CreatedCourseCards />
        </Suspense>
      </div>
    </div>
  );
}

async function CreatedCourseCards() {
  const courses = await api.course.getCreatedCourses();

  return (
    <>
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-900">
            <PlusCircle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">No created courses</h2>
          <p className="text-muted-foreground mb-10 max-w-sm">
            You haven&apos;t created any courses yet. Start your journey by creating your first AI course.
          </p>
          <Link href="/create">
            <Button size="lg" className="px-8 shadow-sm">
              Create Course
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
