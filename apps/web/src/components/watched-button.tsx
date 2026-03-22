"use client";

import { CircleCheck, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { capture } from "@/lib/analytics";
import { useRouter } from "next/navigation";

interface WatchedButtonProps {
	movieId: number;
	isWatched: boolean;
	variant?: "default" | "icon";
	className?: string;
}

export function WatchedButton({
	movieId,
	isWatched,
	variant = "default",
	className,
}: WatchedButtonProps) {
	const router = useRouter();
	const utils = trpc.useUtils();

	const queryKey = { tmdbId: movieId };

	const add = trpc.watched.add.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, isWatched: true, inWatchlist: false } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_marked_watched", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
			toast.error("Failed to mark as watched");
		},
		onSettled: () => {
			utils.movie.getById.invalidate(queryKey);
			utils.watched.invalidate();
			utils.watchlist.invalidate();
			utils.movie.getPopular.invalidate();
			utils.social.getDashboardMatches.invalidate();
			router.refresh();
		},
	});

	const remove = trpc.watched.remove.useMutation({
		onMutate: async () => {
			await utils.movie.getById.cancel(queryKey);
			const previous = utils.movie.getById.getData(queryKey);
			utils.movie.getById.setData(queryKey, (old) =>
				old ? { ...old, isWatched: false } : old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("movie_unmarked_watched", { movie_id: movieId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.movie.getById.setData(queryKey, context.previous);
			}
			toast.error("Failed to remove from watched");
		},
		onSettled: () => {
			utils.movie.getById.invalidate(queryKey);
			utils.watched.invalidate();
			utils.watchlist.invalidate();
			utils.movie.getPopular.invalidate();
			utils.social.getDashboardMatches.invalidate();
			router.refresh();
		},
	});

	const isPending = add.isPending || remove.isPending;

	const handleClick = () => {
		if (isWatched) {
			remove.mutate({ movieId });
		} else {
			add.mutate({ movieId });
		}
	};

	const WatchedIcon = isWatched ? CircleCheck : Eye;

	if (variant === "icon") {
		return (
			<button
				type="button"
				onClick={handleClick}
				disabled={isPending}
				className={cn(
					"flex size-9 items-center justify-center rounded-full transition-colors",
					isWatched
						? "bg-primary text-primary-foreground"
						: "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
					className,
				)}
			>
				<WatchedIcon className="size-4" />
			</button>
		);
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isPending}
			variant={isWatched ? "default" : "secondary"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			<WatchedIcon className="size-3.5" />
			{isWatched ? "Watched" : "Mark Watched"}
		</Button>
	);
}
