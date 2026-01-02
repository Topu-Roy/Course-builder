"use server";

import { type CourseCategory, type Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { searchYouTubeVideo } from "@/server/lib/youtube";
import { type ContentBlock } from "@/lib/types";
import { generateCourseOutline } from "./ai";

export async function createCourse(
  topic: string,
  description: string,
  author: string,
  category: CourseCategory,
  imageUrl?: string
) {
  // 1. Generate the course outline using AI
  const courseOutline = await generateCourseOutline(topic, description, author);

  // 2. Enrich content with real YouTube videos
  const enrichedChapters = await Promise.all(
    courseOutline.chapters.map(async (chapter) => {
      const enrichedBlocks: ContentBlock[] = [];

      for (const block of chapter.content) {
        // Add ID to the block
        enrichedBlocks.push({ ...block, id: crypto.randomUUID() });

        // If it's a heading, try to find a video
        if (block.type === "heading") {
          const searchQuery = `${topic} ${block.content}`;
          const videoUrl = await searchYouTubeVideo(searchQuery);

          if (videoUrl) {
            enrichedBlocks.push({
              id: crypto.randomUUID(),
              type: "video",
              content: videoUrl,
              metadata: { caption: `Video related to ${block.content}` },
            });
          }
        }
      }

      return {
        ...chapter,
        content: enrichedBlocks,
      };
    })
  );

  // 3. Save the course to the database
  const course = await db.course.create({
    data: {
      title: courseOutline.courseTitle,
      description: courseOutline.courseDescription,
      author: author,
      topic: topic,
      category: category,
      imageUrl: imageUrl,
      chapters: {
        create: enrichedChapters.map((chapter, index) => ({
          title: chapter.title,
          content: chapter.content as unknown as Prisma.InputJsonValue,
          order: index,
        })),
      },
    },
  });

  return course;
}
