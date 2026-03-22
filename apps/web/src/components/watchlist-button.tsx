"use client";

import { Bookmark, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { capture } from "@/lib/analytics";
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

	const queryKey = { tmdbId: movieId };

	const add = trpc.watchlist.add.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, inWatchlist: true } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_added_to_watchlist", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
			toast.error("Failed to add to watchlist");
		},
		onSettled: () => {
			utils.movie.getById.invalidate(queryKey);
			utils.watchlist.invalidate();
			utils.movie.getPopular.invalidate();
			router.refresh();
		},
	});

	const remove = trpc.watchlist.remove.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, inWatchlist: false } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_removed_from_watchlist", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
			toast.error("Failed to remove from watchlist");
		},
		onSettled: () => {
			utils.movie.getById.invalidate(queryKey);
			utils.watchlist.invalidate();
			utils.movie.getPopular.invalidate();
			router.refresh();
		},
	});

	const isPending = add.isPending || remove.isPending;

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
			onClick={handleClick}
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
