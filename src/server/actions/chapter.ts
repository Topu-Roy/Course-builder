"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { type ContentBlock } from "@/lib/types";

export async function createChapter(courseId: string, title: string) {
  const lastChapter = await db.chapter.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });

  const newOrder = lastChapter ? lastChapter.order + 1 : 0;

  const chapter = await db.chapter.create({
    data: {
      title,
      courseId,
      order: newOrder,
      // No initial blocks - they'll be added via updateChapter
    },
  });

  revalidatePath(`/course/${courseId}/edit`);
  return chapter;
}

export async function updateChapter(chapterId: string, data: { title?: string; content?: ContentBlock[] }) {
  // First update the chapter title if provided
  if (data.title) {
    await db.chapter.update({
      where: { id: chapterId },
      data: { title: data.title },
    });
  }

  // If content blocks are provided, sync them
  if (data.content) {
    // Delete existing blocks and recreate them
    await db.contentBlock.deleteMany({
      where: { chapterId },
    });

    // Create new blocks
    await db.contentBlock.createMany({
      data: data.content.map((block, index) => ({
        id: block.id,
        chapterId,
        type: block.type,
        content: block.content,
        metadata: block.metadata ?? null,
        order: index,
      })),
    });
  }

  // Revalidate pages
  const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
  if (chapter) {
    revalidatePath(`/course/${chapter.courseId}`);
    revalidatePath(`/course/${chapter.courseId}/edit`);
    revalidatePath(`/course/${chapter.courseId}/chapter/${chapterId}`);
    revalidatePath(`/course/${chapter.courseId}/chapter/${chapterId}/edit`);
  }
}

export async function deleteChapter(chapterId: string) {
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
  });

  if (!chapter) return;

  await db.chapter.delete({
    where: { id: chapterId },
  });

  revalidatePath(`/course/${chapter.courseId}/edit`);
}

export async function reorderChapters(updateList: { id: string; order: number }[]) {
  // Transaction to update all orders
  await db.$transaction(
    updateList.map((item) =>
      db.chapter.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  // We need one chapter to get courseId for revalidation
  if (updateList.length > 0 && updateList[0]) {
    const chapter = await db.chapter.findUnique({ where: { id: updateList[0].id } });
    if (chapter) {
      revalidatePath(`/course/${chapter.courseId}/edit`);
      revalidatePath(`/course/${chapter.courseId}`);
    }
  }
}
