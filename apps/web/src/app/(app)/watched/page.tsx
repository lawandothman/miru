import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { WatchedMovies } from "@/components/watched-movies";

export const metadata: Metadata = {
	title: "Watched",
};

export default async function WatchedPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/signin");
	}

	const api = await trpc();
	const initialMovies = await api.watched.getMyWatched({ limit: 1 });

	if (initialMovies.length === 0) {
		return (
			<div className="space-y-8">
				<div>
					<h1 className="font-display text-2xl font-semibold tracking-tight">
						Watched
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">0 movies</p>
				</div>

				<div className="rounded-xl border border-border/50 bg-card p-10 text-center">
					<h2 className="font-display text-lg font-semibold">
						No watched movies yet
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Mark movies as watched to build your viewing history.
					</p>
					<Link
						href="/explore"
						className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Find Movies
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Watched
				</h1>
			</div>

			<WatchedMovies />
		</div>
	);
}
