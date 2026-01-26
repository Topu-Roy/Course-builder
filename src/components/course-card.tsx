import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollButton } from "./enroll-button";

type CourseCardProps = {
  course: {
    id: string;
    title: string;
    description: string;
    chapters: { id: string }[];
    isEnrolled: boolean;
  };
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex h-full cursor-pointer flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="line-clamp-2 leading-tight">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="grow">
        <p className="text-muted-foreground text-sm">{course.chapters.length} Chapters</p>
      </CardContent>
      <CardFooter>
        {course.isEnrolled ? (
          <Link href={`/course/${course.id}`} className="w-full">
            <Button className="w-full">Continue</Button>
          </Link>
        ) : (
          <EnrollButton courseId={course.id} />
        )}
      </CardFooter>
    </Card>
  );
}
