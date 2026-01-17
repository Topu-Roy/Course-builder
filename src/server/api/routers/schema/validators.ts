import { array, enum as enum_, number, object, string } from "zod/v4";
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

export const updateCourseInput = object({
  courseId: string().nonempty(),
  title: string().nonempty({ message: "Title is required" }),
  description: string().nonempty({ message: "Description is required" }),
});

export const getCourseInput = object({
  courseId: string().nonempty(),
});

export const getCoursesInput = object({
  category: enum_(COURSE_CATEGORIES).optional(),
});

export const deleteCourseInput = object({
  courseId: string().nonempty(),
});

export const createChapterInput = object({
  courseId: string().nonempty(),
  title: string().nonempty({ message: "Title is required" }),
});

export const getChapterInput = object({
  chapterId: string().nonempty({
    message: "Chapter ID is required",
  }),
});

export const updateChapterInput = object({
  chapterId: string().nonempty(),
  title: string().optional(),
  content: array(
    object({
      id: string(),
      type: enum_(["text", "heading", "image", "video", "code"]),
      content: string(),
      metadata: object({
        caption: string().optional().nullable(),
        language: string().optional().nullable(),
        level: number().optional().nullable(),
        subHeading: string().optional().nullable(),
      })
        .nullable()
        .optional(),
    })
  ).optional(),
});

export const deleteChapterInput = object({
  chapterId: string().nonempty(),
});

export const reorderChaptersInput = object({
  list: array(
    object({
      id: string(),
      order: number(),
    })
  ),
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
