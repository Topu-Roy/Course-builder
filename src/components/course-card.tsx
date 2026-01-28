import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EnrollButton } from "./enroll-button";

type CourseCardProps = {
  course: {
    id: string;
    title: string;
    description: string;
    chapters: { id: string }[];
    isEnrolled: boolean;
    progressPercentage?: number;
  };
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex h-full cursor-pointer flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="line-clamp-2 leading-tight">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="grow space-y-4">
        <p className="text-muted-foreground text-sm">{course.chapters.length} Chapters</p>
        {course.isEnrolled && course.progressPercentage !== undefined && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium tracking-wide">PROGRESS</span>
              <div className="flex items-center gap-2">
                <Progress value={course.progressPercentage} className="h-1.5 w-20" />
                <span className="from-primary/10 to-primary/20 text-primary ring-primary/20 inline-flex items-center rounded-full bg-linear-to-r px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset">
                  {course.progressPercentage}%
                </span>
              </div>
            </div>
          </div>
        )}
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
