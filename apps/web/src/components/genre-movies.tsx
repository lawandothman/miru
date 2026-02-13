"use client";

import { useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { InfiniteMovieGrid } from "./infinite-movie-grid";

const PAGE_SIZE = 20;

export function GenreMovies({ genreId }: { genreId: number }) {
	const query = trpc.movie.getByGenre.useInfiniteQuery(
		{ genreId },
		{
			getNextPageParam: (_lastPage, allPages) => {
				return allPages.length + 1;
			},
			initialCursor: 1,
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
			hasMore={
				(query.data?.pages.at(-1)?.length ?? PAGE_SIZE) >= PAGE_SIZE
			}
			isFetching={query.isFetchingNextPage}
			onLoadMore={onLoadMore}
			emptyMessage="No movies in this genre"
		/>
	);
}
