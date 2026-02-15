"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { RotateCcw } from "lucide-react";

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);
	return (
		<div className="relative flex flex-col items-center justify-center py-32 text-center">
			{/* Background glow */}
			<div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				<div className="h-[400px] w-[400px] rounded-full bg-destructive/[0.04] blur-[100px]" />
			</div>

			{/* Broken film strip icon */}
			<div className="relative mb-8 flex items-center gap-1.5 text-muted-foreground/30">
				<div className="flex flex-col gap-1">
					{["a", "b", "c"].map((id) => (
						<div key={id} className="h-1.5 w-5 rounded-full bg-current" />
					))}
				</div>
				<div className="h-10 w-14 rounded border-2 border-current" />
				<div className="h-10 w-14 rounded border-2 border-dashed border-current opacity-40" />
				<div className="flex flex-col gap-1">
					{["d", "e", "f"].map((id) => (
						<div
							key={id}
							className="h-1.5 w-5 rounded-full bg-current opacity-40"
						/>
					))}
				</div>
			</div>

			<h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
				Something went wrong
			</h2>
			<p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
				An unexpected error interrupted the show. Give it another take.
			</p>

			<button
				type="button"
				onClick={reset}
				className="mt-8 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				<RotateCcw className="size-4" />
				Try again
			</button>

			{error.digest && (
				<p className="mt-6 font-mono text-[11px] text-muted-foreground/40">
					Error ID: {error.digest}
				</p>
			)}
		</div>
	);
}
