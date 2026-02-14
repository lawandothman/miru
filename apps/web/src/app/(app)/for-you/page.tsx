import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { ForYouMovies } from "@/components/for-you-movies";
import { MovieGridSkeleton } from "@/components/movie-grid";

export const metadata: Metadata = {
	title: "For You",
};

export default async function ForYouPage() {
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
					For You
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Movies your friends are watching
				</p>
			</div>

			<Suspense fallback={<MovieGridSkeleton />}>
				<ForYouContent />
			</Suspense>
		</div>
	);
}

async function ForYouContent() {
	const api = await trpc();
	const initialMovies = await api.movie.getForYou({ limit: 20 });

	if (initialMovies.length === 0) {
		return (
			<div className="rounded-xl border border-border/50 bg-card p-10 text-center">
				<h2 className="font-display text-lg font-semibold">Nothing here yet</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Follow friends to see their movie recommendations.
				</p>
				<Link
					href="/explore"
					className="mt-6 inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Find Friends
				</Link>
			</div>
		);
	}

	return <ForYouMovies />;
}
