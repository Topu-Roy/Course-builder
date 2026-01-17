"use client";

import { useForm } from "@tanstack/react-form";
import type { CourseCategory } from "@/generated/prisma/enums";
import { createCourseInput } from "@/server/api/routers/schema/validators";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type infer as zodInfer } from "zod/v4";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/navbar";
import { COURSE_CATEGORIES } from "@/lib/constants";

export default function CreateCoursePage() {
  const router = useRouter();
  const { mutate: createCourse, isPending } = api.course.createCourse.useMutation();

  const form = useForm({
    defaultValues: {
      topic: "",
      description: "",
      category: "" as CourseCategory,
      imageUrl: "",
    } satisfies zodInfer<typeof createCourseInput>,
    validators: {
      onSubmit: createCourseInput,
      onChange: createCourseInput,
    },
    onSubmit: ({ value }) => {
      console.log(value);

      createCourse(
        {
          topic: value.topic,
          description: value.description,
          category: value.category,
          imageUrl: value.imageUrl,
        },
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
    },
  });

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
                  <form.Field name="imageUrl">
                    {(field) => (
                      <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                        <FieldLabel htmlFor={field.name}>Image URL</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                          placeholder="https://example.com/image.jpg"
                          disabled={isPending}
                          autoComplete="off"
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
