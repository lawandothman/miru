import { router } from "../trpc";
import { authRouter } from "./auth";
import { moviesRouter } from "./movies";

export const appRouter = router({
  auth: authRouter,
  movies: moviesRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
