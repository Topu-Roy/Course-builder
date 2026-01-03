import "server-only";
import { cache } from "react";
import { createCaller, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createQueryClient } from "./query-client";

const createContext = cache(async () => await createTRPCContext());
const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(caller, getQueryClient);
