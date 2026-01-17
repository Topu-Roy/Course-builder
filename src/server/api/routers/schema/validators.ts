import { enum as enum_, number, object, string } from "zod/v4";
import { COURSE_CATEGORIES } from "@/lib/constants";

export const createCourseInput = object({
  topic: string().nonempty({
    message: "Topic is required",
  }),
  description: string().nonempty({
    message: "Description is required",
  }),
  category: enum_(COURSE_CATEGORIES, { message: "Select a category" }),
  imageUrl: string(),
});

export const getChapterInput = object({
  chapterId: string().nonempty({
    message: "Chapter ID is required",
  }),
});

export const updateProgressInput = object({
  chapterId: string().nonempty({
    message: "Chapter ID is required",
  }),
  progress: number()
    .nonnegative({
      message: "Progress must be a non-negative number",
    })
    .max(100, {
      message: "Progress must be less than or equal to 100",
    }),
});

export const getProgressInput = object({
  chapterId: string().nonempty({
    message: "Chapter ID is required",
  }),
});
