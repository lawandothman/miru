"use client";

import { Bookmark, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
	inWatchlist: boolean;
	onToggle: () => void;
	isPending?: boolean;
	variant?: "default" | "icon";
	className?: string;
}

export function WatchlistButton({
	inWatchlist,
	onToggle,
	isPending = false,
	variant = "default",
	className,
}: WatchlistButtonProps) {
	if (variant === "icon") {
		return (
			<button
				type="button"
				onClick={onToggle}
				disabled={isPending}
				className={cn(
					"flex size-9 items-center justify-center rounded-full transition-colors",
					inWatchlist
						? "bg-primary text-primary-foreground"
						: "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
					className,
				)}
			>
				{inWatchlist ? (
					<Bookmark className="size-4 fill-current" />
				) : (
					<BookmarkPlus className="size-4" />
				)}
			</button>
		);
	}

	return (
		<Button
			onClick={onToggle}
			disabled={isPending}
			variant={inWatchlist ? "default" : "secondary"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			{inWatchlist ? (
				<Bookmark className="size-3.5 fill-current" />
			) : (
				<BookmarkPlus className="size-3.5" />
			)}
			{inWatchlist ? "In Watchlist" : "Add to Watchlist"}
		</Button>
	);
}
