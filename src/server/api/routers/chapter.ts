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
      // Get existing blocks
      const existingBlocks = await ctx.db.contentBlock.findMany({
        where: { chapterId },
        include: { metadata: true },
      });

      const existingIds = new Set(existingBlocks.map((b) => b.id));
      const newIds = new Set(content.map((b) => b.id));

      // Prepare operations
      const toDelete = existingBlocks.filter((b) => !newIds.has(b.id));
      const toCreate = content.filter((b) => !existingIds.has(b.id));
      const toUpdate = content.filter((b) => existingIds.has(b.id));

      // Execute updates in transaction (increased timeout for larger updates)
      await ctx.db.$transaction(
        async (tx) => {
          // Delete removed blocks
          if (toDelete.length > 0) {
            await tx.contentBlock.deleteMany({
              where: { id: { in: toDelete.map((b) => b.id) } },
            });
          }

          // Update existing blocks
          if (toUpdate.length > 0) {
            await Promise.all(
              toUpdate.map((block) => {
                const index = content.findIndex((b) => b.id === block.id);
                return tx.contentBlock.update({
                  where: { id: block.id },
                  data: {
                    type: block.type,
                    content: block.content,
                    order: index,
                  },
                });
              })
            );

            // Update or create metadata for existing blocks
            await Promise.all(
              toUpdate.map(async (block) => {
                const existing = existingBlocks.find((b) => b.id === block.id);
                const hasMetadata =
                  block.metadata && Object.values(block.metadata).some((val) => val !== null && val !== undefined);

                if (hasMetadata) {
                  if (existing?.metadata) {
                    // Update existing metadata
                    return tx.blockMetadata.update({
                      where: { contentBlockId: block.id },
                      data: {
                        caption: block.metadata!.caption,
                        language: block.metadata!.language,
                        level: block.metadata!.level,
                        subHeading: block.metadata!.subHeading,
                      },
                    });
                  } else {
                    // Create new metadata
                    return tx.blockMetadata.create({
                      data: {
                        contentBlockId: block.id,
                        caption: block.metadata!.caption,
                        language: block.metadata!.language,
                        level: block.metadata!.level,
                        subHeading: block.metadata!.subHeading,
                      },
                    });
                  }
                } else if (existing?.metadata) {
                  // Delete metadata if it no longer exists
                  return tx.blockMetadata.delete({
                    where: { contentBlockId: block.id },
                  });
                }
              })
            );
          }

          // Create new blocks
          if (toCreate.length > 0) {
            await Promise.all(
              toCreate.map((block) => {
                const index = content.findIndex((b) => b.id === block.id);
                return tx.contentBlock.create({
                  data: {
                    id: block.id,
                    chapterId,
                    type: block.type,
                    content: block.content,
                    order: index,
                  },
                });
              })
            );

            // Create metadata for new blocks
            await Promise.all(
              toCreate
                .filter(
                  (block) =>
                    block.metadata &&
                    Object.values(block.metadata).some((val) => val !== null && val !== undefined)
                )
                .map((block) => {
                  return tx.blockMetadata.create({
                    data: {
                      contentBlockId: block.id,
                      caption: block.metadata!.caption,
                      language: block.metadata!.language,
                      level: block.metadata!.level,
                      subHeading: block.metadata!.subHeading,
                    },
                  });
                })
            );
          }
        },
        {
          maxWait: 15000, // Wait up to 15s to start transaction
          timeout: 15000, // Allow transaction to run for up to 15s
        }
      );
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
