"use client";

import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import type { CourseCategory } from "@/generated/prisma/enums";
import { type generateCourseOutlineSchema } from "@/server/actions/schema";
import { searchYouTubeVideo } from "@/server/lib/youtube";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { enum as enum_, object, string, type z } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_CATEGORIES } from "@/lib/constants";
import type { ContentBlock } from "@/lib/types";

export const formSchema = object({
  topic: string().nonempty({
    message: "Topic is required",
  }),
  description: string().nonempty({
    message: "Description is required",
  }),
  category: enum_(COURSE_CATEGORIES),
});

export function CreateCourseForm() {
  const router = useRouter();
  const [category, setCategory] = useState<CourseCategory>("OTHER");
  const [outline, setOutline] = useState<z.infer<typeof generateCourseOutlineSchema> | null>(null);
  const { data: searchResults } = useQuery({
    queryKey: ["search"],
    queryFn: async () => {
      const searchTasks = outline?.chapters.flatMap((chapter, chapterIndex) =>
        chapter.content
          .filter((block) => block.type === "heading")
          .map((block) => ({
            chapterIndex,
            content: block.content,
            searchQuery: `${chapter.title} ${block.content}`,
          }))
      );

      if (!searchTasks) return [];

      return Promise.all(
        searchTasks.map(async (task) => ({
          ...task,
          videoUrl: await searchYouTubeVideo(task.searchQuery),
        }))
      );
    },
    enabled: !!outline,
  });
  const { mutate: generateCourseOutline, isPending } = api.createCourse.generateCourseOutline.useMutation();
  const { mutate: createCourse } = api.createCourse.createCourse.useMutation();

  const form = useForm({
    defaultValues: {
      topic: "",
      description: "",
      category: "OTHER" as CourseCategory,
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: ({ value }) => {
      setCategory(value.category);
      generateCourseOutline(
        {
          topic: value.topic,
          description: value.description,
        },
        {
          onSuccess(data) {
            toast.success("Successfully generated course outline!");
            setOutline(data);
          },
          onError() {
            toast.error("Something went wrong. Please try again.");
          },
        }
      );
    },
  });

  useEffect(() => {
    if (!outline || !searchResults) return;

    // 4. Reconstruct the enriched chapters
    const enrichedChapters = outline.chapters.map((chapter, chapterIndex) => {
      const newContent: ContentBlock[] = [];

      chapter.content.forEach((block) => {
        newContent.push({ ...block, id: crypto.randomUUID() });

        // If this block was searched, find its result and inject the video
        if (block.type === "heading") {
          const result = searchResults.find((r) => r.chapterIndex === chapterIndex && r.content === block.content);
          if (result?.videoUrl) {
            newContent.push({
              id: crypto.randomUUID(),
              type: "video",
              content: result.videoUrl,
              metadata: { caption: `Video: ${block.content}` },
            });
          }
        }
      });

      return { ...chapter, content: newContent };
    });

    createCourse(
      {
        topic: outline.courseTitle,
        description: outline.courseDescription,
        chapters: enrichedChapters,
        category: category,
      },
      {
        onSuccess(data) {
          toast.success("Successfully created course!");
          void router.push(`/course/${data.id}/edit`);
        },
        onError() {
          toast.error("Something went wrong. Please try again.");
        },
      }
    );
  }, [category, createCourse, outline, router, searchResults]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldGroup>
          <form.Field name="topic">
            {(field) => (
              <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                <FieldLabel htmlFor={field.name}>Topic</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  placeholder="e.g. Introduction to Python"
                  disabled={isPending}
                />
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.Field>
          <form.Field name="category">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as CourseCategory)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-full" aria-invalid={isInvalid}>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSE_CATEGORIES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  disabled={isPending}
                />
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        <Field orientation="horizontal">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Generating Course..." : "Create Course"}
          </Button>
        </Field>
      </FieldSet>
    </form>
  );
}
