import { db } from "@/server/db";
import { cacheLife } from "next/cache";

export async function getCachedChapter({ chapterId }: { chapterId: string }) {
  "use cache";
  cacheLife("hours");

  const chapter = await db.chapter.findUnique({
    where: {
      id: chapterId,
    },
    select: {
      id: true,
      title: true,
      order: true,
      courseId: true,
      blocks: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          content: true,
          metadata: {
            select: {
              caption: true,
              language: true,
              level: true,
              subHeading: true,
            },
          },
          order: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          chapters: {
            select: {
              id: true,
              title: true,
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  return chapter;
}
