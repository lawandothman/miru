import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { WatchlistMovies } from "@/components/watchlist-movies";
import { MovieGridSkeleton } from "@/components/movie-grid";

export const metadata: Metadata = {
	title: "Watchlist",
};

export default async function WatchlistPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/signin");
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Watchlist
				</h1>
			</div>

			<Suspense fallback={<MovieGridSkeleton />}>
				<WatchlistContent />
			</Suspense>
		</div>
	);
}

async function WatchlistContent() {
	const api = await trpc();
	const initialMovies = await api.watchlist.getMyWatchlist({ limit: 1 });

	if (initialMovies.length === 0) {
		return (
			<div className="rounded-xl border border-border/50 bg-card p-10 text-center">
				<h2 className="font-display text-lg font-semibold">
					Your watchlist is empty
				</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Start adding movies you want to watch.
				</p>
				<Link
					href="/discover"
					className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Find Movies
				</Link>
			</div>
		);
	}

	return <WatchlistMovies />;
}
