"use server";

import { db } from "@/server/db";
import { generateCourseOutline } from "./ai";

export async function createCourse(topic: string, description: string) {
  // 1. Generate the course outline using AI
  const courseOutline = await generateCourseOutline(topic, description);

  // 2. Save the course to the database
  const course = await db.course.create({
    data: {
      title: courseOutline.courseTitle,
      description: courseOutline.courseDescription,
      chapters: {
        create: courseOutline.chapters.map((chapter, index) => ({
          title: chapter.title,
          content: chapter.content, // Initially just the summary, we'll generate full content later
          order: index,
        })),
      },
    },
  });

  return course;
}
