"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h2 className="font-display text-2xl font-bold tracking-tight">
					Build your watchlist
				</h2>
				<p className="text-sm text-muted-foreground">
					Tap movies to add them to your watchlist. This helps us find
					matches with your friends.
				</p>
				{addedIds.size > 0 && (
					<p className="text-sm font-medium text-primary">
						{addedIds.size} movie{addedIds.size !== 1 ? "s" : ""} added
						{addedIds.size >= 5 && " — nice collection!"}
					</p>
				)}
			</div>

			{isLoading ? (
				<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
					{Array.from({ length: 12 }, (_, i) => (
						<div
							key={i}
							className="aspect-[2/3] animate-pulse rounded-lg bg-muted"
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
					{movies?.map((movie) => {
						const isAdded = addedIds.has(movie.id);
						return (
							<button
								key={movie.id}
								type="button"
								onClick={() => {
									if (!isAdded) {
										addToWatchlist.mutate({ movieId: movie.id });
									}
								}}
								disabled={isAdded}
								className={cn(
									"group relative overflow-hidden rounded-lg transition-all",
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
								<div
									className={cn(
										"absolute inset-0 flex items-center justify-center transition-all",
										isAdded
											? "bg-primary/40"
											: "bg-black/0 group-hover:bg-black/30",
									)}
								>
									{isAdded ? (
										<Check className="size-8 text-white drop-shadow-md" />
									) : (
										<Plus className="size-8 text-white opacity-0 drop-shadow-md transition-opacity group-hover:opacity-100" />
									)}
								</div>
							</button>
						);
					})}
				</div>
			)}

			<Button onClick={onComplete} className="w-full" size="lg">
				{addedIds.size === 0 ? "Skip" : "Next"}
			</Button>
		</div>
	);
}
