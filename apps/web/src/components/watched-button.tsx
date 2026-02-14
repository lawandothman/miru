"use client";

import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
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

	const onSuccess = () => {
		utils.watched.invalidate();
		utils.watchlist.invalidate();
		utils.movie.getById.invalidate({ tmdbId: movieId });
		utils.movie.getPopular.invalidate();
		utils.social.getDashboardMatches.invalidate();
		router.refresh();
	};

	const add = trpc.watched.add.useMutation({
		onSuccess,
		onError: () => toast.error("Failed to mark as watched"),
	});
	const remove = trpc.watched.remove.useMutation({
		onSuccess,
		onError: () => toast.error("Failed to remove from watched"),
	});

	const isLoading = add.isPending || remove.isPending;

	const handleClick = () => {
		if (isWatched) {
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
					isWatched
						? "bg-primary text-primary-foreground"
						: "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
					className,
				)}
			>
				{isLoading ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<Eye className={cn("size-4", isWatched && "fill-current")} />
				)}
			</button>
		);
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isLoading}
			variant={isWatched ? "secondary" : "outline"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			{isLoading ? (
				<Loader2 className="size-3.5 animate-spin" />
			) : (
				<Eye className={cn("size-3.5", isWatched && "fill-current")} />
			)}
			{isWatched ? "Watched" : "Mark Watched"}
		</Button>
	);
}
