import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { chapterRouter } from "./routers/chapter";
import { courseRouter } from "./routers/course";
import { createCourseRouter } from "./routers/create-course";

/**
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  course: courseRouter,
  chapter: chapterRouter,
  createCourse: createCourseRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
