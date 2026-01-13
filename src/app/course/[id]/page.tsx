import { db } from "@/server/db";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;

  const course = await db.course.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          userProgress: true,
          blocks: {
            orderBy: { order: "asc" },
            take: 1, // Only fetch first block for preview
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      {/* Course Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-4 text-4xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground text-lg">{course.description}</p>
        </div>
        <Link href={`/course/${course.id}/edit`}>
          <Button variant="outline">Edit Course</Button>
        </Link>
      </div>

      {/* Chapter List */}
      <div className="grid gap-4">
        {course.chapters.map((chapter) => {
          const isCompleted = chapter.userProgress.some((p) => p.completed && p.userId === "user-1");
          const firstBlock = chapter.blocks[0];
          const preview = firstBlock?.content ?? "Click to view chapter content";

          return (
            <Link key={chapter.id} href={`/course/${course.id}/chapter/${chapter.id}`}>
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-medium">{chapter.title}</CardTitle>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="text-muted-foreground h-6 w-6" />
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2 text-sm">{preview}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
