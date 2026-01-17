import { generateCourseOutline } from "@/server/actions/ai";
import {
  createCourseInput,
  getChapterInput,
  getProgressInput,
  updateProgressInput,
} from "@/server/api/routers/schema/validators";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { searchYouTubeVideo } from "@/server/lib/youtube";
import { type ContentBlock } from "@/lib/types";

export const courseRouter = createTRPCRouter({
  createCourse: protectedProcedure.input(createCourseInput).mutation(async ({ ctx, input }) => {
    const { topic, description, category, imageUrl } = input;
    // 1. Generate the course outline using AI
    const courseOutline = await generateCourseOutline(topic, description);

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
    const course = await ctx.db.course.create({
      data: {
        creatorId: ctx.user.id,
        title: courseOutline.courseTitle,
        description: courseOutline.courseDescription,
        topic: topic,
        category: category,
        imageUrl: imageUrl,
        chapters: {
          create: enrichedChapters.map((chapter, index) => ({
            title: chapter.title,
            order: index,
            blocks: {
              create: chapter.content.map((block, blockIndex) => ({
                id: block.id,
                type: block.type,
                content: block.content,
                metadata: {
                  caption: block.metadata?.caption,
                  language: block.metadata?.language,
                  level: block.metadata?.level,
                  subHeading: block.metadata?.subHeading,
                },
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

  getChapter: protectedProcedure.input(getChapterInput).query(async ({ ctx, input }) => {
    const { chapterId } = input;

    const chapter = await ctx.db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        id: true,
        title: true,
        order: true,
        blocks: {
          select: {
            id: true,
            type: true,
            content: true,
            metadata: true,
            order: true,
          },
        },
      },
    });

    return chapter;
  }),

  updateProgress: protectedProcedure.input(updateProgressInput).mutation(async ({ ctx, input }) => {
    const { chapterId, progress } = input;

    const userProgress = await ctx.db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId: ctx.user.id,
          chapterId: chapterId,
        },
      },
      select: {
        progress: true,
        completed: true,
      },
    });

    if (!userProgress) {
      throw new Error("User progress not found");
    }

    await ctx.db.userProgress.update({
      where: {
        userId_chapterId: {
          userId: ctx.user.id,
          chapterId: chapterId,
        },
      },
      data: {
        progress: progress,
        completed: progress === 100,
      },
      select: {
        id: true,
      },
    });

    return userProgress;
  }),

  getProgress: protectedProcedure.input(getProgressInput).query(async ({ ctx, input }) => {
    const { chapterId } = input;

    const userProgress = await ctx.db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId: ctx.user.id,
          chapterId: chapterId,
        },
      },
      select: {
        id: true,
        progress: true,
        completed: true,
        updatedAt: true,
        chapterId: true,
      },
    });

    return userProgress;
  }),
});
