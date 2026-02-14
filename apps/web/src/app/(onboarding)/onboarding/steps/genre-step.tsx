"use client";

import { useEffect, useState } from "react";
import {
	Bomb,
	Drama,
	Ghost,
	Heart,
	Laugh,
	Map,
	Music,
	Puzzle,
	Rocket,
	Search,
	Shield,
	Sparkles,
	Sword,
	Clapperboard,
	Users,
	Wand2,
	type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const genreIcons: Record<string, LucideIcon> = {
	Action: Sword,
	Adventure: Map,
	Animation: Clapperboard,
	Comedy: Laugh,
	Crime: Search,
	Documentary: Clapperboard,
	Drama: Drama,
	Family: Users,
	Fantasy: Wand2,
	History: Clapperboard,
	Horror: Ghost,
	Music: Music,
	Mystery: Puzzle,
	Romance: Heart,
	"Science Fiction": Rocket,
	"TV Movie": Clapperboard,
	Thriller: Shield,
	War: Bomb,
	Western: Map,
};

interface GenreStepProps {
	selectedGenres: number[];
	onSelectionStateChange: (hasSelection: boolean) => void;
	onComplete: (genreIds: number[]) => void;
}

export function GenreStep({
	selectedGenres,
	onSelectionStateChange,
	onComplete,
}: GenreStepProps) {
	const [selected, setSelected] = useState<Set<number>>(
		new Set(selectedGenres),
	);

	const {
		data: genres,
		error,
		isFetching,
		isLoading,
		refetch,
	} = trpc.movie.getGenres.useQuery();
	const setPrefs = trpc.onboarding.setGenrePreferences.useMutation({
		onSuccess: () => onComplete(Array.from(selected)),
		onError: () => toast.error("Failed to save preferences"),
	});

	const isEmpty = !isLoading && !error && (genres?.length ?? 0) === 0;

	const toggle = (id: number) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	useEffect(() => {
		onSelectionStateChange(selected.size > 0);
	}, [onSelectionStateChange, selected]);

	return (
		<form
			id="onboarding-genre-form"
			onSubmit={(event) => {
				event.preventDefault();
				setPrefs.mutate({ genreIds: Array.from(selected) });
			}}
			className="space-y-6"
		>
			<div className="space-y-3 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
					<Sparkles className="size-3.5" />
					Personalize your recommendations
				</div>
				<h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
					What do you like to watch?
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					Choose at least one genre to build your For You feed.
				</p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{Array.from({ length: 16 }, (_, i) => (
						<div
							key={i}
							className="h-24 animate-pulse rounded-2xl bg-muted/60"
						/>
					))}
				</div>
			) : error ? (
				<div className="space-y-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center">
					<p className="text-sm text-muted-foreground">
						We could not load genres right now.
					</p>
					<Button
						type="button"
						variant="secondary"
						onClick={() => refetch()}
						disabled={isFetching}
					>
						{isFetching ? "Retrying..." : "Try again"}
					</Button>
				</div>
			) : isEmpty ? (
				<div className="space-y-2 rounded-2xl border border-border/60 bg-card/50 p-4 text-center">
					<p className="text-sm font-medium">No genres found yet</p>
					<p className="text-sm text-muted-foreground">
						Run `pnpm db:seed` to pull the initial TMDB catalog, then reload.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
					{genres?.map((genre) => {
						const Icon = genreIcons[genre.name] ?? Clapperboard;
						const isSelected = selected.has(genre.id);
						return (
							<button
								key={genre.id}
								type="button"
								onClick={() => toggle(genre.id)}
								className={cn(
									"group relative flex min-h-24 flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl border px-4 py-4 text-center transition-all",
									isSelected
										? "border-amber-500/70 bg-amber-500/15 text-amber-100"
										: "border-border/60 bg-card/40 hover:border-amber-500/40 hover:bg-card",
								)}
							>
								<div
									className={cn(
										"flex size-9 shrink-0 items-center justify-center rounded-xl border",
										isSelected
											? "border-amber-400/40 bg-amber-400/15"
											: "border-border/60 bg-background/60",
									)}
								>
									<Icon className="size-4" />
								</div>
								<span className="w-full text-sm font-medium leading-tight">
									{genre.name}
								</span>
							</button>
						);
					})}
				</div>
			)}

		</form>
	);
}
