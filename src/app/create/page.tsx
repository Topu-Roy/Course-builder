import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCourseForm } from "@/components/create-course-form";
import { Navbar } from "@/components/navbar";

export default function CreateCoursePage() {
  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-md pt-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Course</CardTitle>
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
