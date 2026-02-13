"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center py-24 text-center">
			<h2 className="font-display text-lg font-semibold">
				Something went wrong
			</h2>
			<p className="mt-2 text-sm text-muted-foreground">
				An unexpected error occurred. Please try again.
			</p>
			<Button onClick={reset} className="mt-6" size="sm">
				Try again
			</Button>
		</div>
	);
}
