"use client";

import { type CourseCategory } from "@/generated/prisma/client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const COURSE_CATEGORIES = [
  "TECHNOLOGY",
  "BUSINESS",
  "FINANCE",
  "MARKETING",
  "DESIGN",
  "ART",
  "SCIENCE",
  "ACADEMIC",
  "HEALTH",
  "FITNESS",
  "MUSIC",
  "LIFESTYLE",
  "OTHER",
] satisfies CourseCategory[];

export default function CreateCoursePage() {
  const router = useRouter();
  const { mutate: createCourse, isPending } = api.course.createCourse.useMutation();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const topic = formData.get("topic") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as CourseCategory;
    const imageUrl = (formData.get("imageUrl") as string) ?? undefined;

    createCourse(
      { topic, description, category, imageUrl },
      {
        onSuccess(data) {
          toast.success("Successfully created course! 🎉");
          router.push(`/course/${data.id}`);
        },
        onError() {
          toast.error("Something went wrong. Please try again.");
        },
      }
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Course</CardTitle>
          <CardDescription>Enter a topic and description to generate a course using AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g. Introduction to Python"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" name="author" placeholder="Your name" disabled={isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0) + category.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Thumbnail URL (Optional)</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What specific areas should this course cover?"
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Generating Course..." : "Create Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
