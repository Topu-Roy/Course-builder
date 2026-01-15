import { enum as enum_, object, string } from "zod/v4";
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
