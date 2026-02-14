import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { MoviePoster } from "@/components/movie-poster";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

function getGreeting() {
	const hour = new Date().getHours();
	if (hour < 12) {
		return "Good morning";
	}
	if (hour < 18) {
		return "Good afternoon";
	}
	return "Good evening";
}

export default async function DashboardPage() {
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
					{getGreeting()}, {session.user.name.split(" ")[0]}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Movies you and your friends can watch together.
				</p>
			</div>

			<Suspense fallback={<DashboardMatchesSkeleton />}>
				<DashboardMatches />
			</Suspense>
		</div>
	);
}

async function DashboardMatches() {
	const api = await trpc();
	const friendsWithMatches = await api.social.getDashboardMatches();

	if (friendsWithMatches.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No matches yet</EmptyTitle>
					<EmptyDescription>
						Follow friends and add movies to your watchlist to find matches.
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

	return (
		<div className="space-y-6">
			{friendsWithMatches.map((friend) => (
				<div key={friend.id} className="space-y-3">
					<Link
						href={`/user/${friend.id}`}
						className="group flex items-center gap-3"
					>
						<UserAvatar
							name={friend.name ?? "?"}
							image={friend.image}
							size="sm"
						/>
						<div>
							<p className="text-sm font-medium transition-colors group-hover:text-primary">
								{friend.name}
							</p>
							<p className="text-xs text-muted-foreground">
								{friend.matches.length}{" "}
								{friend.matches.length === 1 ? "match" : "matches"}
							</p>
						</div>
					</Link>
					<div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
						{friend.matches.slice(0, 10).map((movie) => (
							<MoviePoster
								key={movie.id}
								id={movie.id}
								title={movie.title}
								posterPath={movie.posterPath}
								className="w-28 shrink-0"
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

function DashboardMatchesSkeleton() {
	return (
		<div className="space-y-6">
			{Array.from({ length: 3 }, (_, i) => (
				<div key={i} className="space-y-3">
					<div className="flex items-center gap-3">
						<Skeleton className="size-8 rounded-full" />
						<div className="space-y-1.5">
							<Skeleton className="h-3.5 w-24" />
							<Skeleton className="h-3 w-16" />
						</div>
					</div>
					<div className="flex gap-2">
						{Array.from({ length: 5 }, (_, j) => (
							<Skeleton
								key={j}
								className="aspect-[2/3] w-28 shrink-0 rounded-lg"
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
