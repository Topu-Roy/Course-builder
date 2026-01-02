"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createCourse } from "@/server/actions/course";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type CourseCategory } from "@/generated/prisma/client";

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
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const topic = formData.get("topic") as string;
    const description = formData.get("description") as string;
    const author = (formData.get("author") as string) || "Anonymous";
    const category = formData.get("category") as CourseCategory;
    const imageUrl = (formData.get("imageUrl") as string) || undefined;

    try {
      const course = await createCourse(topic, description, author, category, imageUrl);
      toast.success("Course created successfully!");
      router.push(`/course/${course.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
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
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" name="author" placeholder="Your name" disabled={loading} />
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What specific areas should this course cover?"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Generating Course..." : "Create Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
