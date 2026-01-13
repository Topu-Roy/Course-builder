"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

/**
 * Toggle completion status for a chapter.
 * Creates progress record if it doesn't exist, or toggles the existing one.
 */
export async function toggleChapterCompletion(courseId: string, chapterId: string, userId = "user-1") {
  const existingProgress = await db.userProgress.findUnique({
    where: {
      userId_chapterId: {
        userId,
        chapterId,
      },
    },
  });

  if (existingProgress) {
    await db.userProgress.update({
      where: {
        id: existingProgress.id,
      },
      data: {
        completed: !existingProgress.completed,
      },
    });
  } else {
    await db.userProgress.create({
      data: {
        userId,
        chapterId,
        completed: true,
      },
    });
  }

  revalidatePath(`/course/${courseId}`);
  revalidatePath(`/course/${courseId}/chapter/${chapterId}`);
}
