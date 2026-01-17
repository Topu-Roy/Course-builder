import {
  createChapterInput,
  deleteChapterInput,
  reorderChaptersInput,
  updateChapterInput,
} from "@/server/api/routers/schema/validators";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const chapterRouter = createTRPCRouter({
  create: protectedProcedure.input(createChapterInput).mutation(async ({ ctx, input }) => {
    const { courseId, title } = input;

    // Verify ownership/authorship logic could go here

    const lastChapter = await ctx.db.chapter.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const newOrder = lastChapter ? lastChapter.order + 1 : 0;

    const chapter = await ctx.db.chapter.create({
      data: {
        title,
        courseId,
        order: newOrder,
      },
    });

    return chapter;
  }),

  update: protectedProcedure.input(updateChapterInput).mutation(async ({ ctx, input }) => {
    const { chapterId, title, content } = input;

    // Update title if provided
    if (title) {
      await ctx.db.chapter.update({
        where: { id: chapterId },
        data: { title },
      });
    }

    // Update content blocks if provided
    if (content) {
      // Transaction to handle content replacement
      await ctx.db.$transaction(async (tx) => {
        // Delete existing blocks
        await tx.contentBlock.deleteMany({
          where: { chapterId },
        });

        // Create new blocks
        if (content.length > 0) {
          await Promise.all(
            content.map((block, index) => {
              return tx.contentBlock.create({
                data: {
                  id: block.id,
                  chapterId,
                  type: block.type,
                  content: block.content,
                  order: index,
                  metadata: block.metadata
                    ? {
                        create: {
                          caption: block.metadata.caption,
                          language: block.metadata.language,
                          level: block.metadata.level,
                          subHeading: block.metadata.subHeading,
                        },
                      }
                    : undefined,
                },
              });
            })
          );
        }
      });
    }

    return { success: true };
  }),

  delete: protectedProcedure.input(deleteChapterInput).mutation(async ({ ctx, input }) => {
    const { chapterId } = input;

    await ctx.db.chapter.delete({
      where: { id: chapterId },
    });

    return { success: true };
  }),

  reorder: protectedProcedure.input(reorderChaptersInput).mutation(async ({ ctx, input }) => {
    const { list } = input;

    // Transaction to update all orders
    await ctx.db.$transaction(
      list.map((item) =>
        ctx.db.chapter.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return { success: true };
  }),
});
