"use client";

import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
	title: string;
	text: string;
	variant?: "default" | "icon" | "ghost";
	className?: string;
}

export function ShareButton({
	title,
	text,
	variant = "default",
	className,
}: ShareButtonProps) {
	const { copied, copy } = useCopyToClipboard();

	const handleShare = async () => {
		const url = window.location.href;

		if (navigator.share) {
			try {
				await navigator.share({ title, text, url });
				return;
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}
			}
		}

		await copy(url);
	};

	const Icon = copied ? Check : Share2;

	if (variant === "icon") {
		return (
			<button
				type="button"
				onClick={handleShare}
				className={cn(
					"flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20",
					className,
				)}
			>
				<Icon className="size-4" />
			</button>
		);
	}

	if (variant === "ghost") {
		return (
			<Button
				onClick={handleShare}
				variant="ghost"
				size="icon"
				className={cn("text-muted-foreground", className)}
			>
				<Icon className="size-5" />
			</Button>
		);
	}

	return (
		<Button
			onClick={handleShare}
			variant="outline"
			size="sm"
			className={cn("gap-1.5", className)}
		>
			<Icon className="size-3.5" />
			{copied ? "Copied" : "Share"}
		</Button>
	);
}
