"use client";

import { Bookmark, BookmarkPlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
	movieId: number;
	inWatchlist: boolean;
	variant?: "default" | "icon";
	className?: string;
}

export function WatchlistButton({
	movieId,
	inWatchlist,
	variant = "default",
	className,
}: WatchlistButtonProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const onSuccess = () => {
		utils.watchlist.invalidate();
		utils.watched.invalidate();
		utils.movie.getById.invalidate({ tmdbId: movieId });
		utils.movie.getPopular.invalidate();
		router.refresh();
	};

	const add = trpc.watchlist.add.useMutation({
		onSuccess,
		onError: () => toast.error("Failed to add to watchlist"),
	});
	const remove = trpc.watchlist.remove.useMutation({
		onSuccess,
		onError: () => toast.error("Failed to remove from watchlist"),
	});

	const isLoading = add.isPending || remove.isPending;

	const handleClick = () => {
		if (inWatchlist) {
			remove.mutate({ movieId });
		} else {
			add.mutate({ movieId });
		}
	};

	if (variant === "icon") {
		return (
			<button
				type="button"
				onClick={handleClick}
				disabled={isLoading}
				className={cn(
					"flex size-9 items-center justify-center rounded-full transition-colors",
					inWatchlist
						? "bg-primary text-primary-foreground"
						: "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
					className,
				)}
			>
				{isLoading ? (
					<Spinner />
				) : (
					{inWatchlist ? (
						<Bookmark className="size-4 fill-current" />
					) : (
						<BookmarkPlus className="size-4" />
					)}
				)}
			</button>
		);
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isLoading}
			variant={inWatchlist ? "default" : "secondary"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			{isLoading ? (
				<Spinner className="size-3.5" />
			) : (
				{inWatchlist ? (
					<Bookmark className="size-3.5 fill-current" />
				) : (
					<BookmarkPlus className="size-3.5" />
				)}
			)}
			{inWatchlist ? "In Watchlist" : "Add to Watchlist"}
		</Button>
	);
}
