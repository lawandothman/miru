export type { NotificationType, TypedNotificationData } from "@miru/db/schema";
export {
	type Context,
	type CreateContextOptions,
	createContext,
	type Session,
} from "./context";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./routers/index";

export { type AppRouter, appRouter } from "./routers/index";
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export { createCallerFactory } from "./trpc";
export { TMDB } from "@lorenzopant/tmdb";
