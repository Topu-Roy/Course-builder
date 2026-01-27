import { generateCourseOutline } from "@/server/actions/ai";
import {
  createCourseInput,
  deleteCourseInput,
  enrollCourseInput,
  getChapterInput,
  getCourseInput,
  getCoursesInput,
  getProgressInput,
  getSidebarDataInput,
  updateCourseInput,
  updateProgressInput,
} from "@/server/api/routers/schema/validators";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { searchYouTubeVideo } from "@/server/lib/youtube";
import { TRPCError } from "@trpc/server";
import { type ContentBlock } from "@/lib/types";
import { getCachedChapter } from "./query/getChapter";

export const courseRouter = createTRPCRouter({
  createCourse: protectedProcedure.input(createCourseInput).mutation(async ({ ctx, input }) => {
    const { topic, description, category, imageUrl } = input;
    // 1. Generate the course outline using AI
    const courseOutline = await generateCourseOutline(topic, description);

    // 2. Identify all search tasks across all chapters
    const searchTasks = courseOutline.chapters.flatMap((chapter, chapterIndex) =>
      chapter.content
        .filter((block) => block.type === "heading")
        .map((block) => ({
          chapterIndex,
          content: block.content,
          searchQuery: `${topic} ${block.content}`,
        }))
    );

    // 3. Search EVERYTHING in parallel
    // This fires all YouTube requests at once
    const searchResults = await Promise.all(
      searchTasks.map(async (task) => ({
        ...task,
        videoUrl: await searchYouTubeVideo(task.searchQuery),
      }))
    );

    // 4. Reconstruct the enriched chapters
    const enrichedChapters = courseOutline.chapters.map((chapter, chapterIndex) => {
      const newContent: ContentBlock[] = [];

      chapter.content.forEach((block) => {
        newContent.push({ ...block, id: crypto.randomUUID() });

        // If this block was searched, find its result and inject the video
        if (block.type === "heading") {
          const result = searchResults.find((r) => r.chapterIndex === chapterIndex && r.content === block.content);
          if (result?.videoUrl) {
            newContent.push({
              id: crypto.randomUUID(),
              type: "video",
              content: result.videoUrl,
              metadata: { caption: `Video: ${block.content}` },
            });
          }
        }
      });

      return { ...chapter, content: newContent };
    });

    // 5. Save the course to the database
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

  enroll: protectedProcedure.input(enrollCourseInput).mutation(async ({ ctx, input }) => {
    const { courseId } = input;

    await ctx.db.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: {
            id: ctx.user.id,
          },
        },
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

  getAll: publicProcedure.input(getCoursesInput.optional()).query(async ({ ctx, input }) => {
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
        students: {
          where: {
            id: ctx.user?.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return courses.map((course) => ({
      ...course,
      isEnrolled: course.students.length > 0,
      students: undefined, // Hide students list
    }));
  }),

  getCreatedCourses: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.course.findMany({
      where: {
        creatorId: ctx.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        chapters: true,
        students: {
          where: {
            id: ctx.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return courses.map((course) => ({
      ...course,
      isEnrolled: course.students.length > 0,
      students: undefined,
    }));
  }),

  getEnrolledCourses: protectedProcedure.query(async ({ ctx }) => {
    const courses = await ctx.db.course.findMany({
      where: {
        students: {
          some: {
            id: ctx.user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        chapters: true,
        students: {
          where: {
            id: ctx.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return courses.map((course) => ({
      ...course,
      isEnrolled: true,
      students: undefined,
    }));
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

    const isCreator = course.creatorId === ctx.user.id;
    // Keep it simple: check if user is in students list (need to fetch it first or use exists query)
    // Optimized: Check enrollment separately if needed, or include it in the query.
    // Let's modify the query above to check enrollment efficiently.

    const enrollment = await ctx.db.course.findUnique({
      where: { id: courseId },
      select: {
        students: {
          where: { id: ctx.user.id },
          select: { id: true },
        },
      },
    });

    const isEnrolled = (enrollment?.students.length ?? 0) > 0;

    if (!isCreator && !isEnrolled) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You must be enrolled to view this course." });
    }

    return course;
  }),

  getCourseChapters: protectedProcedure.input(getCourseInput).query(async ({ ctx, input }) => {
    const { courseId } = input;

    const course = await ctx.db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        creatorId: true,
        description: true,
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
                chapter: {
                  select: {
                    id: true,
                  },
                },
                completed: true,
              },
            },
            blocks: {
              where: {
                type: {
                  in: ["heading"],
                },
              },
              orderBy: { order: "asc" },
              select: {
                id: true,
                content: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
    }

    const isCreator = course.creatorId === ctx.user.id;

    const enrollment = await ctx.db.course.findUnique({
      where: {
        id: courseId,
        students: {
          some: { id: ctx.user.id },
        },
      },
      select: {
        id: true,
      },
    });

    const isEnrolled = enrollment?.id;

    if (!isCreator && !isEnrolled) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You must be enrolled to view this course." });
    }

    return { course, isCreator };
  }),

  getChapter: protectedProcedure.input(getChapterInput).query(async ({ ctx, input }) => {
    const enrolled = await ctx.db.course.findFirst({
      where: {
        id: input.courseId,
        students: {
          some: { id: ctx.user.id },
        },
      },
      select: {
        id: true,
        creatorId: true,
      },
    });

    const isCreator = enrolled?.creatorId === ctx.user.id;

    if (isCreator) {
      return await getCachedChapter({ chapterId: input.chapterId });
    }

    if (!enrolled) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You must be enrolled to view this chapter." });
    }

    const chapter = await getCachedChapter({ chapterId: input.chapterId });

    if (!chapter) throw new TRPCError({ code: "NOT_FOUND", message: "Chapter not found" });

    return chapter;
  }),

  updateProgress: protectedProcedure.input(updateProgressInput).mutation(async ({ ctx, input }) => {
    const { chapterId, progress } = input;

    const userProgress = await ctx.db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: ctx.user.id,
          chapterId: chapterId,
        },
      },
      update: {
        progress: progress,
        completed: progress === 100,
      },
      create: {
        userId: ctx.user.id,
        chapterId: chapterId,
        progress: progress,
        completed: progress === 100,
      },
      select: {
        id: true,
        progress: true,
        completed: true,
      },
    });

    return userProgress;
  }),

  getSidebarData: protectedProcedure.input(getSidebarDataInput).query(async ({ ctx, input }) => {
    const { courseId } = input;

    const course = await ctx.db.course.findUnique({
      where: { id: courseId },
      select: {
        title: true,
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
                progress: true,
              },
            },
          },
        },
        students: {
          where: { id: ctx.user.id },
          select: { id: true },
        },
      },
    });

    if (!course) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
    }

    const isCreator = course.creatorId === ctx.user.id;
    const isEnrolled = course.students.length > 0;

    if (!isCreator && !isEnrolled) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You must be enrolled to view this course." });
    }

    return {
      title: course.title,
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        order: chapter.order,
        userProgress: chapter.userProgress[0] ?? { completed: false, progress: 0 },
      })),
    };
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
