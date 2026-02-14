"use client";

import { useCallback } from "react";
import { PAGE_SIZE } from "@/lib/constants";
import { trpc } from "@/lib/trpc/client";
import { InfiniteMovieGrid } from "./infinite-movie-grid";

export function GenreMovies({ genreId }: { genreId: number }) {
	const query = trpc.movie.getByGenre.useInfiniteQuery(
		{ genreId },
		{
			getNextPageParam: (_lastPage, allPages) => {
				const total = allPages.flat().length;
				return total;
			},
			initialCursor: 0,
		},
	);

	const movies = query.data?.pages.flat() ?? [];

	const { fetchNextPage } = query;
	const onLoadMore = useCallback(() => {
		fetchNextPage();
	}, [fetchNextPage]);

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
			emptyMessage="No movies in this genre"
		/>
	);
}
