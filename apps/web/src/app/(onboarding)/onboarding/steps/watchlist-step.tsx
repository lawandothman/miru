"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface WatchlistStepProps {
	genreIds: number[];
	onComplete: () => void;
}

export function WatchlistStep({ genreIds, onComplete }: WatchlistStepProps) {
	const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

	const { data: movies, isLoading } =
		trpc.onboarding.getRecommendedMovies.useQuery(
			{ genreIds, limit: 20 },
			{ enabled: genreIds.length > 0 },
		);

	const addToWatchlist = trpc.watchlist.add.useMutation({
		onSuccess: (_data, variables) => {
			setAddedIds((prev) => new Set(prev).add(variables.movieId));
		},
		onError: () => toast.error("Failed to add movie"),
	});

	const removeFromWatchlist = trpc.watchlist.remove.useMutation({
		onSuccess: (_data, variables) => {
			setAddedIds((prev) => {
				const next = new Set(prev);
				next.delete(variables.movieId);
				return next;
			});
		},
		onError: () => toast.error("Failed to remove movie"),
	});

	const toggleMovie = (movieId: number) => {
		if (addedIds.has(movieId)) {
			removeFromWatchlist.mutate({ movieId });
		} else {
			addToWatchlist.mutate({ movieId });
		}
	};

	return (
		<form
			id="onboarding-watchlist-form"
			onSubmit={(event) => {
				event.preventDefault();
				onComplete();
			}}
			className="space-y-6"
		>
			<div className="space-y-3 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
					<Sparkles className="size-3.5" />
					Your watchlist
				</div>
				<h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
					Pick some movies
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					Save anything that catches your eye. When a friend saves the same
					thing, you&apos;ll both know.
				</p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 12 }, (_, i) => (
						<div
							key={i}
							className="aspect-[2/3] animate-pulse rounded-xl bg-muted"
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{movies?.map((movie, i) => {
						const isAdded = addedIds.has(movie.id);
						return (
							<button
								key={movie.id}
								type="button"
								onClick={() => toggleMovie(movie.id)}
								style={{ animationDelay: `${Math.min(i * 40, 600)}ms` }}
								className={cn(
									"group animate-scale-in relative overflow-hidden rounded-xl transition-all",
									isAdded && "ring-2 ring-primary",
								)}
							>
								<div className="aspect-[2/3] bg-muted">
									{movie.posterPath ? (
										<Image
											src={`https://image.tmdb.org/t/p/w342${movie.posterPath}`}
											alt={movie.title}
											fill
											className="object-cover"
											sizes="(max-width: 640px) 33vw, 25vw"
										/>
									) : (
										<div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
											{movie.title}
										</div>
									)}
								</div>
								{isAdded ? (
									<div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/40">
										<Check className="size-8 text-white drop-shadow-md" />
									</div>
								) : (
									<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
										<Plus className="size-8 text-white drop-shadow-md" />
									</div>
								)}
							</button>
						);
					})}
				</div>
			)}

			{!isLoading && (movies?.length ?? 0) === 0 && (
				<div className="rounded-2xl border border-border/70 bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
					No recommendations yet. Continue and we&apos;ll refine suggestions as
					you use Miru.
				</div>
			)}
		</form>
	);
}
