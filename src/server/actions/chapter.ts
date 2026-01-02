"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

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
      content: [], // Empty initially
    },
  });

  revalidatePath(`/course/${courseId}/edit`);
  return chapter;
}

import { type Prisma } from "@/generated/prisma/client";

export async function updateChapter(chapterId: string, data: { title?: string; content?: unknown }) {
  await db.chapter.update({
    where: { id: chapterId },
    data: {
      ...data,
      content: data.content as Prisma.InputJsonValue,
    },
  });

  // Revalidate both edit and view pages
  // We need to fetch courseId to revalidate course page?
  // But we don't have it easily here without a fetch.
  // However, revalidating the specific chapter page is possible if we knew the courseId.
  // For now, let's fetch the chapter to get the courseId.
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
  if (updateList.length > 0) {
    const chapter = await db.chapter.findUnique({ where: { id: updateList[0].id } });
    if (chapter) {
      revalidatePath(`/course/${chapter.courseId}/edit`);
      revalidatePath(`/course/${chapter.courseId}`);
    }
  }
}
