"use server";

import { db } from "@/server/db";
import { generateCourseOutline } from "./ai";
import { searchYouTubeVideo } from "@/server/lib/youtube";

export async function createCourse(topic: string, description: string, author: string) {
  // 1. Generate the course outline using AI
  const courseOutline = await generateCourseOutline(topic, description, author);

  // 2. Enrich content with real YouTube videos
  const enrichedChapters = await Promise.all(
    courseOutline.chapters.map(async (chapter) => {
      const enrichedContent = await Promise.all(
        chapter.content.map(async (section) => {
          // Search for a relevant video if this section doesn't have one
          if (!section.videoUrl && section.heading) {
            // Build a more specific search query including subheading for better targeting
            const searchParts = [topic, section.heading];
            if (section.subHeading) {
              searchParts.push(section.subHeading);
            }
            const searchQuery = searchParts.join(" ");
            const videoUrl = await searchYouTubeVideo(searchQuery);

            return {
              ...section,
              videoUrl: videoUrl || undefined,
            };
          }
          return section;
        })
      );

      return {
        ...chapter,
        content: enrichedContent,
      };
    })
  );

  // 3. Save the course to the database
  const course = await db.course.create({
    data: {
      title: courseOutline.courseTitle,
      description: courseOutline.courseDescription,
      chapters: {
        create: enrichedChapters.map((chapter, index) => ({
          title: chapter.title,
          content: chapter.content,
          order: index,
        })),
      },
    },
  });

  return course;
}
