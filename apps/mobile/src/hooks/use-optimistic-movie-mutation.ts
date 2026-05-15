import type { RouterOutputs } from "@miru/trpc";
import type { EventName, EventProperties } from "@miru/analytics";
import { trpc } from "@/lib/trpc";
import { capture } from "@/lib/analytics";

type MovieDetail = RouterOutputs["movie"]["getById"];

type MovieEventName = {
	[K in EventName]: EventProperties[K] extends { movie_id: number } ? K : never;
}[EventName];

interface OptimisticMovieMutationArgs {
	movieId: number;
	patch: (cached: MovieDetail) => MovieDetail;
	analyticsEvent: MovieEventName;
}

interface MutationContext {
	previous: MovieDetail | undefined;
}

export function useOptimisticMovieMutation({
	movieId,
	patch,
	analyticsEvent,
}: OptimisticMovieMutationArgs) {
	const utils = trpc.useUtils();
	const queryKey = { tmdbId: movieId };

	return {
		onMutate: async (): Promise<MutationContext> => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) => (old ? patch(old) : old));
			return { previous };
		},
		onSuccess: () => {
			capture(analyticsEvent, { movie_id: movieId });
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
	};
}
