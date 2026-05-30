import type { RouterOutputs } from "@miru/trpc";
import { trpc } from "@/lib/trpc";
import { capture } from "@/lib/analytics";

type MovieDetail = RouterOutputs["movie"]["getById"];

interface MutationContext {
	previous: MovieDetail | undefined;
}

export function useRateMovie(movieId: number) {
	const utils = trpc.useUtils();
	const queryKey = { tmdbId: movieId };

	return trpc.watched.rate.useMutation({
		onMutate: async ({ rating }): Promise<MutationContext> => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) => {
				if (!old) {
					return old;
				}
				// Clearing keeps the movie watched; rating marks it watched.
				return rating === null
					? { ...old, myRating: null }
					: { ...old, myRating: rating, isWatched: true, inWatchlist: false };
			});
			return { previous };
		},
		onSuccess: (_data, { rating }) => {
			if (rating) {
				capture("movie_rated", { movie_id: movieId, rating });
			}
		},
		onError: (
			_err: unknown,
			_vars: unknown,
			context: MutationContext | undefined,
		) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
		},
		onSettled: () => {
			utils.movie.getById.invalidate(queryKey);
			utils.watchlist.getMyWatchlist.invalidate();
			utils.watched.getMyWatched.invalidate();
			utils.social.getDashboardMatches.invalidate();
			utils.social.getMatchesWith.invalidate();
			utils.recommendation.getForMovie.invalidate({ movieId });
		},
	});
}
