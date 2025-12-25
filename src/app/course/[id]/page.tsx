import { db } from "@/server/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ContentBlock } from "@/lib/types";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: {
          order: "asc",
        },
        include: {
          userProgress: true, // We'll filter this later for the specific user
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg text-muted-foreground">{course.description}</p>
        </div>
        <Link href={`/course/${course.id}/edit`}>
          <Button variant="outline">Edit Course</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {course.chapters.map((chapter) => {
          const isCompleted = chapter.userProgress.some((p) => p.completed && p.userId === "user-1");

          return (
            <Link key={chapter.id} href={`/course/${course.id}/chapter/${chapter.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-medium">{chapter.title}</CardTitle>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {Array.isArray(chapter.content) && chapter.content.length > 0
                      ? (chapter.content as unknown as ContentBlock[])[0]?.content ||
                        "Click to view chapter content"
                      : "Click to view chapter content"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
