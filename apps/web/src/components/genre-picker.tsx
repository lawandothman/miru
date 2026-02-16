"use client";

import {
	Bomb,
	Camera,
	Drama,
	Film,
	Ghost,
	Heart,
	Landmark,
	Laugh,
	Map,
	Music,
	Puzzle,
	Rocket,
	Search,
	Shield,
	Sword,
	Tv,
	Users,
	Wand2,
	type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const genreIcons: Record<string, LucideIcon> = {
	Action: Sword,
	Adventure: Map,
	Animation: Film,
	Comedy: Laugh,
	Crime: Search,
	Documentary: Camera,
	Drama: Drama,
	Family: Users,
	Fantasy: Wand2,
	History: Landmark,
	Horror: Ghost,
	Music: Music,
	Mystery: Puzzle,
	Romance: Heart,
	"Science Fiction": Rocket,
	"TV Movie": Tv,
	Thriller: Shield,
	War: Bomb,
	Western: Map,
};

interface GenrePickerProps {
	genres: { id: number; name: string }[];
	selected: Set<number>;
	onToggle: (id: number) => void;
	/** Compact mode for dialogs, full mode for onboarding */
	compact?: boolean;
	/** Enable staggered scale-in animation */
	animated?: boolean;
}

export function GenrePicker({
	genres,
	selected,
	onToggle,
	compact = false,
	animated = false,
}: GenrePickerProps) {
	return (
		<div
			className={cn(
				"grid",
				compact
					? "grid-cols-2 gap-2 sm:grid-cols-3"
					: "grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4",
			)}
		>
			{genres.map((genre, i) => {
				const Icon = genreIcons[genre.name] ?? Film;
				const isSelected = selected.has(genre.id);
				return (
					<button
						key={genre.id}
						type="button"
						onClick={() => onToggle(genre.id)}
						style={
							animated
								? { animationDelay: `${Math.min(i * 30, 500)}ms` }
								: undefined
						}
						className={cn(
							"group relative flex flex-col items-center justify-center overflow-hidden border text-center transition-all",
							animated && "animate-scale-in",
							compact
								? "gap-1.5 rounded-xl p-2.5"
								: "min-h-24 gap-2.5 rounded-2xl px-4 py-4",
							isSelected
								? "border-amber-500/70 bg-amber-500/15 text-amber-100"
								: "border-border/60 bg-card/40 hover:border-amber-500/40 hover:bg-card",
						)}
					>
						<div
							className={cn(
								"flex shrink-0 items-center justify-center rounded-xl",
								compact ? "size-7" : "size-9",
								isSelected
									? "bg-amber-400/15"
									: "border border-border/60 bg-background/60",
							)}
						>
							<Icon className={compact ? "size-3.5" : "size-4"} />
						</div>
						<span
							className={cn(
								"w-full font-medium leading-tight",
								compact ? "text-xs" : "text-sm",
							)}
						>
							{genre.name}
						</span>
					</button>
				);
			})}
		</div>
	);
}
