"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
	const [copied, setCopied] = useState(false);
	const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (copiedTimeoutRef.current) {
				clearTimeout(copiedTimeoutRef.current);
			}
		};
	}, []);

	const handleCopyLink = async (url: string) => {
		await navigator.clipboard.writeText(url);
		toast("Link copied");
		setCopied(true);

		if (copiedTimeoutRef.current) {
			clearTimeout(copiedTimeoutRef.current);
		}

		copiedTimeoutRef.current = setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

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
				// Fall back to clipboard when native share fails.
			}
		}

		try {
			await handleCopyLink(url);
		} catch {
			toast.error("Unable to copy link");
		}
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
