"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Film, SearchX } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { InfiniteMovieGrid } from "@/components/infinite-movie-grid";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";

interface Filters {
	genres: number[];
	yearGte: number | undefined;
	yearLte: number | undefined;
}

interface ExploreResultsProps {
	query: string;
	filters: Filters;
	genreList: { id: number; name: string }[];
}

export function ExploreResults({
	query,
	filters,
	genreList,
}: ExploreResultsProps) {
	const hasFilters =
		filters.genres.length > 0 ||
		filters.yearGte !== undefined ||
		filters.yearLte !== undefined;

	const isSearching = query.length > 0;
	const isDiscovering = !isSearching && hasFilters;

	if (isDiscovering) {
		return <DiscoverResults filters={filters} genreList={genreList} />;
	}

	if (isSearching) {
		return <SearchResults query={query} filters={filters} />;
	}

	return null;
}

function EmptyResults({
	icon: IconComponent,
	message,
	hint,
}: {
	icon: typeof SearchX;
	message: string;
	hint: string;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
				<IconComponent className="size-5 text-muted-foreground" />
			</div>
			<p className="text-sm font-medium">{message}</p>
			<p className="mt-1 text-xs text-muted-foreground">{hint}</p>
		</div>
	);
}

function ResultCount({ count }: { count: number }) {
	if (count === 0) {
		return null;
	}
	return (
		<span className="text-xs tabular-nums text-muted-foreground">
			{count.toLocaleString()} {count === 1 ? "result" : "results"}
		</span>
	);
}

function SearchResults({
	query,
	filters,
}: {
	query: string;
	filters: Filters;
}) {
	const searchQuery = trpc.movie.search.useInfiniteQuery(
		{
			query,
			...(filters.genres.length > 0 ? { genres: filters.genres } : {}),
			...(filters.yearGte ? { year: filters.yearGte } : {}),
		},
		{
			enabled: query.length > 0,
			getNextPageParam: (lastPage) =>
				lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
			initialCursor: 1,
		},
	);

	const users = trpc.social.searchUsers.useQuery(
		{ query },
		{ enabled: query.length > 0 },
	);

	const movies = dedupeById(
		searchQuery.data?.pages.flatMap((p) => p.results) ?? [],
	);
	const totalResults = searchQuery.data?.pages[0]?.totalResults ?? 0;

	const { fetchNextPage } = searchQuery;
	const onLoadMore = useCallback(() => {
		fetchNextPage();
	}, [fetchNextPage]);

	const lastPage = searchQuery.data?.pages.at(-1);
	const hasMore = lastPage ? lastPage.page < lastPage.totalPages : false;

	const showEmpty =
		!searchQuery.isLoading &&
		movies.length === 0 &&
		!searchQuery.isFetchingNextPage;

	return (
		<div className="space-y-8">
			{users.data && users.data.length > 0 && (
				<div className="space-y-3">
					<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						People
					</h2>
					<div className="space-y-2">
						{users.data.map((user) => (
							<div
								key={user.id}
								className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3 transition-colors hover:border-border hover:bg-card/80"
							>
								<Link
									href={`/user/${user.id}`}
									className="flex items-center gap-3"
								>
									<UserAvatar
										name={user.name ?? "?"}
										image={user.image}
										size="sm"
									/>
									<span className="text-sm font-medium">{user.name}</span>
								</Link>
								<FollowButton userId={user.id} isFollowing={user.isFollowing} />
							</div>
						))}
					</div>
				</div>
			)}

			<div className="space-y-3">
				<div className="flex items-baseline justify-between">
					<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Movies
					</h2>
					<ResultCount count={totalResults} />
				</div>
				{showEmpty ? (
					<EmptyResults
						icon={SearchX}
						message="No movies found"
						hint="Try a different search term or adjust your filters"
					/>
				) : (
					<InfiniteMovieGrid
						movies={movies.map((m) => ({
							id: m.id,
							posterPath: m.posterPath ?? null,
							title: m.title,
						}))}
						hasMore={hasMore}
						isFetching={searchQuery.isFetchingNextPage}
						isLoading={searchQuery.isLoading}
						onLoadMore={onLoadMore}
					/>
				)}
			</div>
		</div>
	);
}

function DiscoverResults({
	filters,
	genreList,
}: {
	filters: Filters;
	genreList: { id: number; name: string }[];
}) {
	const discoverQuery = trpc.movie.discover.useInfiniteQuery(
		{
			...(filters.genres.length > 0 ? { genres: filters.genres } : {}),
			...(filters.yearGte ? { yearGte: filters.yearGte } : {}),
			...(filters.yearLte ? { yearLte: filters.yearLte } : {}),
		},
		{
			getNextPageParam: (lastPage) =>
				lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
			initialCursor: 1,
		},
	);

	const movies = dedupeById(
		discoverQuery.data?.pages.flatMap((p) => p.results) ?? [],
	);
	const totalResults = discoverQuery.data?.pages[0]?.totalResults ?? 0;

	const { fetchNextPage } = discoverQuery;
	const onLoadMore = useCallback(() => {
		fetchNextPage();
	}, [fetchNextPage]);

	const lastPage = discoverQuery.data?.pages.at(-1);
	const hasMore = lastPage ? lastPage.page < lastPage.totalPages : false;

	const showEmpty =
		!discoverQuery.isLoading &&
		movies.length === 0 &&
		!discoverQuery.isFetchingNextPage;

	const contextParts: string[] = [];
	if (filters.genres.length > 0) {
		const names = filters.genres
			.map((id) => genreList.find((g) => g.id === id)?.name)
			.filter(Boolean);
		if (names.length > 0) {
			contextParts.push(names.join(", "));
		}
	}
	if (filters.yearGte && filters.yearLte) {
		contextParts.push(`${filters.yearGte}–${filters.yearLte}`);
	} else if (filters.yearGte) {
		contextParts.push(`from ${filters.yearGte}`);
	} else if (filters.yearLte) {
		contextParts.push(`up to ${filters.yearLte}`);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-baseline justify-between">
				<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Discover
					{contextParts.length > 0 && (
						<span className="ml-1 normal-case tracking-normal font-normal">
							— {contextParts.join(", ")}
						</span>
					)}
				</h2>
				<ResultCount count={totalResults} />
			</div>
			{showEmpty ? (
				<EmptyResults
					icon={Film}
					message="No movies found"
					hint="Try broadening your filters"
				/>
			) : (
				<InfiniteMovieGrid
					movies={movies.map((m) => ({
						id: m.id,
						posterPath: m.posterPath ?? null,
						title: m.title,
					}))}
					hasMore={hasMore}
					isFetching={discoverQuery.isFetchingNextPage}
					isLoading={discoverQuery.isLoading}
					onLoadMore={onLoadMore}
				/>
			)}
		</div>
	);
}

function dedupeById<T extends { id: number }>(items: T[]): T[] {
	const seen = new Set<number>();
	return items.filter((item) => {
		if (seen.has(item.id)) {
			return false;
		}
		seen.add(item.id);
		return true;
	});
}
