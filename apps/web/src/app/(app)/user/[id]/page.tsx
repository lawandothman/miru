import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { MovieGrid } from "@/components/movie-grid";
import { SignOutButton } from "./sign-out-button";

interface UserPageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: UserPageProps): Promise<Metadata> {
	const { id } = await params;
	const api = await trpc();
	try {
		const user = await api.user.getById({ id });
		return { title: user.name };
	} catch {
		return { title: "User" };
	}
}

export default async function UserPage({ params }: UserPageProps) {
	const { id } = await params;

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const api = await trpc();

	let user;
	try {
		user = await api.user.getById({ id });
	} catch {
		notFound();
	}

	const isOwnProfile = session?.user.id === id;
	const [watchlist, watched] = await Promise.all([
		api.watchlist.getUserWatchlist({ limit: 30, userId: id }),
		api.watched.getUserWatched({ limit: 30, userId: id }),
	]);

	let matches: {
		id: number;
		title: string;
		posterPath: string | null;
		inWatchlist: boolean;
	}[] = [];
	if (session && !isOwnProfile) {
		matches = await api.social.getMatchesWith({ friendId: id });
	}

	return (
		<div className="space-y-8">
			{/* Profile Header */}
			<div className="flex items-start gap-5">
				<UserAvatar name={user.name ?? "?"} image={user.image} size="xl" />
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="font-display text-2xl font-semibold tracking-tight">
							{user.name}
						</h1>
						{user.isBot && (
							<span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
								Bot
							</span>
						)}
					</div>
					<div className="mt-2 flex gap-4 text-sm text-muted-foreground">
						{!isOwnProfile && matches.length > 0 && (
							<span>
								<strong className="text-foreground">{matches.length}</strong>{" "}
								matches
							</span>
						)}
						<span>
							<strong className="text-foreground">{user.followerCount}</strong>{" "}
							followers
						</span>
						<span>
							<strong className="text-foreground">{user.followingCount}</strong>{" "}
							following
						</span>
					</div>
					<div className="mt-4 flex gap-2">
						{!isOwnProfile && session && (
							<FollowButton userId={id} isFollowing={user.isFollowing} />
						)}
						{isOwnProfile && <SignOutButton />}
					</div>
				</div>
			</div>

			{/* Matches */}
			{matches.length > 0 && (
				<div className="space-y-4">
					<h2 className="font-display text-lg font-semibold">Matches</h2>
					<MovieGrid
						movies={matches.map((m) => ({
							id: m.id,
							posterPath: m.posterPath,
							title: m.title,
						}))}
					/>
				</div>
			)}

			{/* Watchlist */}
			<div className="space-y-4">
				<h2 className="font-display text-lg font-semibold">
					{isOwnProfile
						? "Your Watchlist"
						: `${user.name?.split(" ")[0]}'s Watchlist`}
				</h2>
				<MovieGrid
					movies={watchlist.map((m) => ({
						id: m.id,
						posterPath: m.posterPath,
						title: m.title,
					}))}
					emptyMessage="No movies in watchlist"
				/>
			</div>

			{/* Watched */}
			<div className="space-y-4">
				<h2 className="font-display text-lg font-semibold">
					{isOwnProfile
						? "Your Watched"
						: `${user.name?.split(" ")[0]}'s Watched`}
				</h2>
				<MovieGrid
					movies={watched.map((m) => ({
						id: m.id,
						posterPath: m.posterPath,
						title: m.title,
					}))}
					emptyMessage="No watched movies"
				/>
			</div>
		</div>
	);
}
