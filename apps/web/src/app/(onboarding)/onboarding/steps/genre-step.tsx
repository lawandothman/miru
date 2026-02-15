"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GenrePicker } from "@/components/genre-picker";
import { trpc } from "@/lib/trpc/client";

interface GenreStepProps {
	selectedGenres: number[];
	onSelectionChange: (genreIds: number[]) => void;
	onComplete: (genreIds: number[]) => void;
}

export function GenreStep({
	selectedGenres,
	onSelectionChange,
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
			onSelectionChange(Array.from(next));
			return next;
		});
	};

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
					Your taste
				</div>
				<h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
					What do you like to watch?
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					Pick your favourites and we&apos;ll recommend things you&apos;ll love.
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
					<p className="text-sm font-medium">No genres available</p>
					<p className="text-sm text-muted-foreground">
						Please try again later.
					</p>
				</div>
			) : (
				<GenrePicker
					genres={genres ?? []}
					selected={selected}
					onToggle={toggle}
					animated
				/>
			)}
		</form>
	);
}
