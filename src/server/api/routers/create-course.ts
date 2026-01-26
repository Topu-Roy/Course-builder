import { generateCourseOutline } from "@/server/actions/ai";
import { createCourseInput, generateCourseOutlineInput } from "@/server/api/routers/schema/validators";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const createCourseRouter = createTRPCRouter({
  generateCourseOutline: protectedProcedure.input(generateCourseOutlineInput).mutation(async ({ input }) => {
    const { topic, description } = input;

    const courseOutline = await generateCourseOutline(topic, description);
    return courseOutline;
  }),

  createCourse: protectedProcedure.input(createCourseInput).mutation(async ({ ctx, input }) => {
    const { topic, description, category, imageUrl, chapters } = input;

    const course = await ctx.db.course.create({
      data: {
        creatorId: ctx.user.id,
        title: topic,
        description: description,
        topic: topic,
        category: category,
        imageUrl: imageUrl,
        chapters: {
          create: chapters.map((chapter, index) => ({
            title: chapter.title,
            order: index,
            blocks: {
              create: chapter.content.map((block, blockIndex) => ({
                id: block.id,
                type: block.type,
                content: block.content,
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
                order: blockIndex,
              })),
            },
          })),
        },
      },
      select: {
        id: true,
      },
    });

    return course;
  }),
});
