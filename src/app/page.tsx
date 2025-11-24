import { db } from "@/server/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function Home() {
  const courses = await db.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      chapters: true,
    },
  });

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">All Courses</h1>
        <Link href="/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">No courses found</h2>
          <p className="text-muted-foreground mb-8">
            Get started by creating your first AI-generated course.
          </p>
          <Link href="/create">
            <Button size="lg">Create Course</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.chapters.length} Chapters</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
