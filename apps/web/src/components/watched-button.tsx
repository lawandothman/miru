"use client";

import { CircleCheck, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
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

	const WatchedIcon = isWatched ? CircleCheck : Eye;

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
				{isLoading ? <Spinner /> : <WatchedIcon className="size-4" />}
			</button>
		);
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isLoading}
			variant={isWatched ? "default" : "secondary"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			{isLoading ? (
				<Spinner className="size-3.5" />
			) : (
				<WatchedIcon className="size-3.5" />
			)}
			{isWatched ? "Watched" : "Mark Watched"}
		</Button>
	);
}
