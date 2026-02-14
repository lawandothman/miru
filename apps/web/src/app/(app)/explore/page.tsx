"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 300);

	const movies = trpc.movie.search.useQuery(
		{ query: debouncedQuery },
		{ enabled: debouncedQuery.length > 0 },
	);

	const users = trpc.social.searchUsers.useQuery(
		{ query: debouncedQuery },
		{ enabled: debouncedQuery.length > 0 },
	);

	const genres = trpc.movie.getGenres.useQuery();
	const isSearching = debouncedQuery.length > 0;

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Explore
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Search for movies and people
				</p>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search movies or people..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="h-11 rounded-xl pl-10"
				/>
			</div>

			{isSearching ? (
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
										className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3"
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
										<FollowButton
											userId={user.id}
											isFollowing={user.isFollowing}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="space-y-3">
						<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Movies
						</h2>
						{movies.isLoading ? (
							<MovieGridSkeleton count={8} />
						) : movies.data ? (
							<MovieGrid
								movies={movies.data.results.map((r) => ({
									id: r.id,
									posterPath: r.posterPath ?? null,
									title: r.title,
								}))}
								emptyMessage="No movies found"
							/>
						) : null}
					</div>
				</div>
			) : (
				<div className="space-y-3">
					<h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Genres
					</h2>
					{genres.isLoading ? (
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
							{Array.from({ length: 12 }, (_, i) => `genre-skeleton-${i}`).map(
								(id) => (
									<Skeleton key={id} className="h-14 rounded-xl" />
								),
							)}
						</div>
					) : (
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
							{genres.data?.map((genre) => (
								<Link
									key={genre.id}
									href={`/genre/${genre.id}`}
									className="flex h-14 items-center justify-center rounded-xl border border-border/50 bg-card text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary"
								>
									{genre.name}
								</Link>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
