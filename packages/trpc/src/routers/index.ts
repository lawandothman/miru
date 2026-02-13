import { router } from "../trpc";
import { movieRouter } from "./movie";
import { socialRouter } from "./social";
import { userRouter } from "./user";
import { watchlistRouter } from "./watchlist";

export const appRouter = router({
	movie: movieRouter,
	social: socialRouter,
	user: userRouter,
	watchlist: watchlistRouter,
});

export type AppRouter = typeof appRouter;
