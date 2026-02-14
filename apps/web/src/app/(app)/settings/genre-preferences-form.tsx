"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export function GenrePreferencesForm() {
	const [selected, setSelected] = useState<Set<number>>(new Set());

	const { data: genres } = trpc.movie.getGenres.useQuery();
	const { data: state, isLoading } = trpc.onboarding.getState.useQuery();

	const setPrefs = trpc.onboarding.setGenrePreferences.useMutation({
		onSuccess: () => toast.success("Genre preferences saved"),
		onError: () => toast.error("Failed to save preferences"),
	});

	useEffect(() => {
		if (state?.genreIds) {
			setSelected(new Set(state.genreIds));
		}
	}, [state?.genreIds]);

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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="size-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-2">
				{genres?.map((genre) => {
					const isSelected = selected.has(genre.id);
					return (
						<button
							key={genre.id}
							type="button"
							onClick={() => toggle(genre.id)}
							className={cn(
								"rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
								isSelected
									? "border-primary bg-primary/10 text-primary"
									: "border-border hover:border-primary/50",
							)}
						>
							{genre.name}
						</button>
					);
				})}
			</div>
			<Button
				size="sm"
				onClick={() => setPrefs.mutate({ genreIds: Array.from(selected) })}
				disabled={selected.size === 0 || setPrefs.isPending}
			>
				{setPrefs.isPending ? "Saving..." : "Save preferences"}
			</Button>
		</div>
	);
}
