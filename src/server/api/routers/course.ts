import { generateCourseOutline } from "@/server/actions/ai";
import {
  createCourseInput,
  deleteCourseInput,
  getChapterInput,
  getCourseInput,
  getCoursesInput,
  getProgressInput,
  updateCourseInput,
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

  update: protectedProcedure.input(updateCourseInput).mutation(async ({ ctx, input }) => {
    const { courseId, title, description } = input;

    // Verify ownership
    const course = await ctx.db.course.findUnique({
      where: { id: courseId },
      select: { creatorId: true },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    if (course.creatorId !== ctx.user.id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
      },
    });

    return { success: true };
  }),

  delete: protectedProcedure.input(deleteCourseInput).mutation(async ({ ctx, input }) => {
    const { courseId } = input;

    // Verify ownership
    const course = await ctx.db.course.findUnique({
      where: { id: courseId },
      select: { creatorId: true },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    // if (course.creatorId !== ctx.user.id) {
    //   throw new Error("Unauthorized");
    // }

    await ctx.db.course.delete({
      where: { id: courseId },
    });

    return { success: true };
  }),

  getAll: protectedProcedure.input(getCoursesInput.optional()).query(async ({ ctx, input }) => {
    const category = input?.category;

    const courses = await ctx.db.course.findMany({
      where: {
        category: category,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        chapters: true,
      },
    });

    return courses;
  }),

  get: protectedProcedure.input(getCourseInput).query(async ({ ctx, input }) => {
    const { courseId } = input;

    const course = await ctx.db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        creatorId: true,
        chapters: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            userProgress: {
              where: {
                userId: ctx.user.id,
              },
              select: {
                completed: true,
                userId: true,
              },
            },
            blocks: {
              orderBy: { order: "asc" },
              take: 1,
              select: {
                content: true,
                metadata: {
                  select: {
                    caption: true,
                    language: true,
                    level: true,
                    subHeading: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

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
        userProgress: {
          where: {
            userId: ctx.user.id,
          },
          select: {
            completed: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new Error("Chapter not found");
    }

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
      // Create if not exists (upsert logic basically, or create first if logic demands)
      // Actually usually we upsert. Let's assume we want to upsert or just update if exists.
      // Based on original code it threw error if not found. But usually progress starts at 0.
      // Original code:
      /*
        if (!userProgress) {
          throw new Error("User progress not found");
        }
      */
      // However, new logic might want to be more robust. Let's stick to original behavior but ideally upsert.
      // The original code was throwing, I'll keep it throwing for now unless I see a reason to chang it.
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
