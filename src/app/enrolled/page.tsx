import { Suspense } from "react";
import { api } from "@/trpc/server";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/course-card";
import { Navbar } from "@/components/navbar";

export default function EnrolledCoursesPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-10 lg:px-2 2xl:px-0">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold md:text-4xl">Enrolled Courses</h1>
          <Link href="/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>

        <Suspense fallback={<CourseGridSkeleton />}>
          <EnrolledCourseCards />
        </Suspense>
      </div>
    </>
  );
}

async function EnrolledCourseCards() {
  const courses = await api.course.getEnrolledCourses();

  return (
    <>
      {courses.length === 0 ? (
        <div className="py-20 text-center">
          <h2 className="mb-4 text-2xl font-semibold">No enrolled courses</h2>
          <p className="text-muted-foreground mb-8">You haven&apos;t enrolled in any courses yet.</p>
          <Link href="/">
            <Button size="lg">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex h-full flex-col">
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />

            <div className="space-y-1 pt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardHeader>

          <CardContent className="grow">
            <Skeleton className="h-4 w-20" />
          </CardContent>

          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
