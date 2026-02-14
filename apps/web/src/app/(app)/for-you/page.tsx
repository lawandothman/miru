import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { ForYouMovies } from "@/components/for-you-movies";
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
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Nothing here yet</EmptyTitle>
					<EmptyDescription>
						Follow friends to see their movie recommendations.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<Link href="/explore">Find Friends</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return <ForYouMovies />;
}
