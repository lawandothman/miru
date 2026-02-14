"use client";

import { useState } from "react";
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
	onComplete: (genreIds: number[]) => void;
}

export function GenreStep({ selectedGenres, onComplete }: GenreStepProps) {
	const [selected, setSelected] = useState<Set<number>>(
		new Set(selectedGenres),
	);

	const { data: genres, isLoading } = trpc.movie.getGenres.useQuery();
	const setPrefs = trpc.onboarding.setGenrePreferences.useMutation({
		onSuccess: () => onComplete(Array.from(selected)),
		onError: () => toast.error("Failed to save preferences"),
	});

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

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h2 className="font-display text-2xl font-bold tracking-tight">
					What do you like to watch?
				</h2>
				<p className="text-sm text-muted-foreground">
					Pick your favourite genres so we can recommend movies you'll love.
				</p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{Array.from({ length: 12 }, (_, i) => (
						<div
							key={i}
							className="h-16 animate-pulse rounded-xl bg-muted"
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{genres?.map((genre) => {
						const Icon = genreIcons[genre.name] ?? Clapperboard;
						const isSelected = selected.has(genre.id);
						return (
							<button
								key={genre.id}
								type="button"
								onClick={() => toggle(genre.id)}
								className={cn(
									"flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
									isSelected
										? "border-primary bg-primary/10 text-primary"
										: "border-border bg-card hover:border-primary/50",
								)}
							>
								<Icon className="size-5 shrink-0" />
								<span className="text-sm font-medium">{genre.name}</span>
							</button>
						);
					})}
				</div>
			)}

			<Button
				onClick={() => setPrefs.mutate({ genreIds: Array.from(selected) })}
				disabled={selected.size === 0 || setPrefs.isPending}
				className="w-full"
				size="lg"
			>
				{setPrefs.isPending ? "Saving..." : "Next"}
			</Button>
		</div>
	);
}
