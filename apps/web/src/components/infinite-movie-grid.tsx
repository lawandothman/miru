"use client";

import { useCallback, useEffect, useRef } from "react";
import { MoviePoster } from "./movie-poster";
import { MovieGridSkeleton } from "./movie-grid";
import { Spinner } from "@/components/ui/spinner";

interface Movie {
	id: number;
	title: string;
	posterPath: string | null;
}

interface InfiniteMovieGridProps {
	movies: Movie[];
	hasMore: boolean;
	isFetching: boolean;
	isLoading?: boolean;
	onLoadMore: () => void;
	emptyMessage?: string;
}

export function InfiniteMovieGrid({
	movies,
	hasMore,
	isFetching,
	isLoading,
	onLoadMore,
	emptyMessage = "No movies found",
}: InfiniteMovieGridProps) {
	const sentinelRef = useRef<HTMLDivElement>(null);

	const handleIntersect = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			if (entries[0]?.isIntersecting && !isFetching) {
				onLoadMore();
			}
		},
		[isFetching, onLoadMore],
	);

	// Stable observer — recreate when hasMore, isLoading, or callback identity changes
	// isLoading is needed because the sentinel isn't mounted during the loading state
	useEffect(() => {
		const el = sentinelRef.current;
		if (!el || !hasMore) {
			return;
		}

		const observer = new IntersectionObserver(handleIntersect, {
			rootMargin: "400px",
		});

		observer.observe(el);
		return () => observer.disconnect();
	}, [hasMore, isLoading, handleIntersect]);

	// When fetching completes, check if sentinel is still visible to continue loading
	useEffect(() => {
		if (!isFetching && hasMore && sentinelRef.current) {
			const rect = sentinelRef.current.getBoundingClientRect();
			if (rect.top < window.innerHeight + 400) {
				onLoadMore();
			}
		}
	}, [isFetching, hasMore, onLoadMore]);

	if (isLoading) {
		return <MovieGridSkeleton />;
	}

	if (movies.length === 0 && !isFetching) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<p className="text-sm text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{movies.map((movie, i) => (
					<MoviePoster
						key={movie.id}
						id={movie.id}
						title={movie.title}
						posterPath={movie.posterPath}
						priority={i < 10}
					/>
				))}
			</div>

			{/* Sentinel for IntersectionObserver */}
			{hasMore && (
				<div ref={sentinelRef} className="flex justify-center py-8">
					{isFetching && <Spinner className="size-5 text-muted-foreground" />}
				</div>
			)}
		</div>
	);
}
