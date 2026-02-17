import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
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
	EmptyMedia,
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
			<div className="relative">
				<div className="pointer-events-none absolute -left-12 -top-10 h-36 w-72 rounded-full bg-primary/[0.06] blur-3xl" />
				<h1 className="relative font-display text-2xl font-semibold tracking-tight">
					For You
				</h1>
				<p className="relative mt-1 text-sm text-muted-foreground">
					Personalized picks based on your taste
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
					<EmptyMedia variant="icon">
						<Sparkles />
					</EmptyMedia>
					<EmptyTitle>Nothing here yet</EmptyTitle>
					<EmptyDescription>
						Add genres you like, follow friends, or explore movies to get
						personalized recommendations.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<Link href="/explore">Discover Movies</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return <ForYouMovies />;
}
