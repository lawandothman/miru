"use client";

import { useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { InfiniteMovieGrid } from "./infinite-movie-grid";

const PAGE_SIZE = 20;

export function WatchedMovies() {
	const query = trpc.watched.getMyWatched.useInfiniteQuery(
		{ limit: PAGE_SIZE },
		{
			getNextPageParam: (_lastPage, allPages) => {
				const total = allPages.flat().length;
				return total;
			},
			initialCursor: 0,
		},
	);

	const movies = query.data?.pages.flat() ?? [];

	const onLoadMore = useCallback(() => {
		if (query.hasNextPage && !query.isFetchingNextPage) {
			query.fetchNextPage();
		}
	}, [query]);

	return (
		<InfiniteMovieGrid
			movies={movies.map((m) => ({
				id: m.id,
				posterPath: m.posterPath,
				title: m.title,
			}))}
			hasMore={(query.data?.pages.at(-1)?.length ?? PAGE_SIZE) >= PAGE_SIZE}
			isFetching={query.isFetchingNextPage}
			isLoading={query.isLoading}
			onLoadMore={onLoadMore}
		/>
	);
}
