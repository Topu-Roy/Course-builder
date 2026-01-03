import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const memoryRouter = createTRPCRouter({
  getMemories: protectedProcedure.query(async ({ ctx }) => {
    const memories = await ctx.db.checkInMemory.findMany({
      where: {
        dailyCheckIn: {
          userId: ctx.user.id,
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return memories;
  }),

  getTotalMemoryCount: protectedProcedure.query(async ({ ctx }) => {
    const totalMemories = await ctx.db.checkInMemory.count({
      where: {
        dailyCheckIn: {
          userId: ctx.user.id,
        },
      },
    });

    return totalMemories;
  }),
});
