import { router } from "../trpc";
import { movieRouter } from "./movie";
import { socialRouter } from "./social";
import { userRouter } from "./user";
import { watchedRouter } from "./watched";
import { watchlistRouter } from "./watchlist";

export const appRouter = router({
	movie: movieRouter,
	social: socialRouter,
	user: userRouter,
	watched: watchedRouter,
	watchlist: watchlistRouter,
});

export type AppRouter = typeof appRouter;
