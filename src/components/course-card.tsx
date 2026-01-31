import { BookOpen, ChevronRight } from "lucide-react";
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
    <Card className="group bg-background flex h-full flex-col overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-2xl">
      <CardHeader className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase sm:text-xs">
            {course.chapters.length} Chapters
          </span>
        </div>
        <CardTitle className="group-hover:text-primary line-clamp-2 text-xl leading-tight font-bold tracking-tight transition-colors sm:text-2xl">
          {course.title}
        </CardTitle>
        <CardDescription className="mt-2 line-clamp-3 text-sm leading-relaxed sm:text-base">
          {course.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex grow flex-col justify-end p-5 pt-0 sm:p-6">
        {course.isEnrolled && course.progressPercentage !== undefined && (
          <div className="group-hover:bg-primary/5 mt-4 space-y-3 rounded-xl bg-slate-50 p-4 transition-colors dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Progress
              </span>
              <span className="text-primary text-xs font-bold">{course.progressPercentage}%</span>
            </div>
            <Progress value={course.progressPercentage} className="h-1.5" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 sm:p-6">
        {course.isEnrolled ? (
          <Link href={`/course/${course.id}`} className="w-full">
            <Button className="h-11 w-full rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] sm:h-12">
              Continue Learning
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div className="w-full">
            <EnrollButton courseId={course.id} />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
