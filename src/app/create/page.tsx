import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCourseForm } from "@/components/create-course-form";
import { Navbar } from "@/components/navbar";

export default function CreateCoursePage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-md px-4 pt-8 lg:px-2 2xl:px-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold md:text-2xl">Create a New Course</CardTitle>
            <CardDescription>Enter a topic and description to generate a course using AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCourseForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
