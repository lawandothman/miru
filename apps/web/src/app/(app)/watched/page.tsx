import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { WatchedMovies } from "@/components/watched-movies";
import { MovieGridSkeleton } from "@/components/movie-grid";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";

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

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-semibold tracking-tight">
					Watched
				</h1>
			</div>

			<Suspense fallback={<MovieGridSkeleton />}>
				<WatchedContent />
			</Suspense>
		</div>
	);
}

async function WatchedContent() {
	const api = await trpc();
	const initialMovies = await api.watched.getMyWatched({ limit: 1 });

	if (initialMovies.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No watched movies yet</EmptyTitle>
					<EmptyDescription>
						Mark movies as watched to build your viewing history.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<Link href="/explore">Find Movies</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return <WatchedMovies />;
}
