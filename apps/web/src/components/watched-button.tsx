"use client";

import { CircleCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WatchedButtonProps {
	isWatched: boolean;
	onToggle: () => void;
	isPending?: boolean;
	variant?: "default" | "icon";
	className?: string;
}

export function WatchedButton({
	isWatched,
	onToggle,
	isPending = false,
	variant = "default",
	className,
}: WatchedButtonProps) {
	const WatchedIcon = isWatched ? CircleCheck : Eye;

	if (variant === "icon") {
		return (
			<button
				type="button"
				onClick={onToggle}
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
			onClick={onToggle}
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
