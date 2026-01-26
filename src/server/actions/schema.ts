import { z } from "zod";

export const generateCourseOutlineSchema = z.object({
  courseTitle: z.string(),
  courseDescription: z.string(),
  author: z.string(),
  chapters: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      content: z.array(
        z.object({
          type: z.enum(["text", "image", "video", "code", "heading"]),
          content: z.string(),
          metadata: z
            .object({
              level: z.number().optional(),
              language: z.string().optional(),
              caption: z.string().optional(),
            })
            .optional(),
        })
      ),
    })
  ),
});
