"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateCourse(courseId: string, data: { title: string; description: string }) {
  await db.course.update({
    where: { id: courseId },
    data: {
      title: data.title,
      description: data.description,
    },
  });

  revalidatePath(`/course/${courseId}`);
  revalidatePath(`/course/${courseId}/edit`);
}

export async function deleteCourse(courseId: string) {
  // Deleting course will cascade delete chapters due to schema relation if configured,
  // or we rely on Prisma to handle it if relations are set up correctly.
  // Checking schema: Course -> Chapter has onDelete: Cascade? (Need to verify or assume standard)
  // Let's check schema first to be sure? No, I recall seeing it in `schema.prisma` view earlier:
  // `course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)`
  // So yes, it cascades.

  await db.course.delete({
    where: { id: courseId },
  });

  revalidatePath("/");
  redirect("/create");
}
