"use client";

import { useState } from "react";
import { toast } from "sonner";
import { WatchedButton } from "@/components/watched-button";
import { WatchlistButton } from "@/components/watchlist-button";
import { capture } from "@/lib/analytics";
import { trpc } from "@/lib/trpc/client";

interface MovieActionsProps {
	movieId: number;
	inWatchlist: boolean;
	isWatched: boolean;
}

export function MovieActions({
	movieId,
	inWatchlist,
	isWatched,
}: MovieActionsProps) {
	const utils = trpc.useUtils();
	const [inList, setInList] = useState(inWatchlist);
	const [watched, setWatched] = useState(isWatched);

	const addWatchlist = trpc.watchlist.add.useMutation({
		onMutate: () => setInList(true),
		onSuccess: () => capture("movie_added_to_watchlist", { movie_id: movieId }),
		onError: () => {
			setInList(false);
			toast.error("Failed to add to watchlist");
		},
		onSettled: () => {
			void utils.watchlist.invalidate();
			void utils.social.getDashboardMatches.invalidate();
		},
	});

	const removeWatchlist = trpc.watchlist.remove.useMutation({
		onMutate: () => setInList(false),
		onSuccess: () =>
			capture("movie_removed_from_watchlist", { movie_id: movieId }),
		onError: () => {
			setInList(true);
			toast.error("Failed to remove from watchlist");
		},
		onSettled: () => {
			void utils.watchlist.invalidate();
			void utils.social.getDashboardMatches.invalidate();
		},
	});

	const addWatched = trpc.watched.add.useMutation({
		onMutate: () => {
			const previousInList = inList;
			setWatched(true);
			setInList(false);
			return { previousInList };
		},
		onSuccess: () => capture("movie_marked_watched", { movie_id: movieId }),
		onError: (_err, _vars, context) => {
			setWatched(false);
			setInList(context?.previousInList ?? false);
			toast.error("Failed to mark as watched");
		},
		onSettled: () => {
			void utils.watched.invalidate();
			void utils.watchlist.invalidate();
			void utils.social.getDashboardMatches.invalidate();
		},
	});

	const removeWatched = trpc.watched.remove.useMutation({
		onMutate: () => setWatched(false),
		onSuccess: () => capture("movie_unmarked_watched", { movie_id: movieId }),
		onError: () => {
			setWatched(true);
			toast.error("Failed to remove from watched");
		},
		onSettled: () => {
			void utils.watched.invalidate();
			void utils.social.getDashboardMatches.invalidate();
		},
	});

	const watchlistPending = addWatchlist.isPending || removeWatchlist.isPending;
	const watchedPending = addWatched.isPending || removeWatched.isPending;

	return (
		<>
			<WatchlistButton
				inWatchlist={inList}
				isPending={watchlistPending}
				onToggle={() =>
					inList
						? removeWatchlist.mutate({ movieId })
						: addWatchlist.mutate({ movieId })
				}
			/>
			<WatchedButton
				isWatched={watched}
				isPending={watchedPending}
				onToggle={() =>
					watched
						? removeWatched.mutate({ movieId })
						: addWatched.mutate({ movieId })
				}
			/>
		</>
	);
}
