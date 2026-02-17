import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { auth } from "@/lib/auth";
import { trpc } from "@/lib/trpc/server";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { FollowersDialog } from "@/components/followers-dialog";
import { ShareButton } from "@/components/share-button";
import { MovieGrid, MovieGridSkeleton } from "@/components/movie-grid";
import { ProfileTabs } from "@/components/profile-tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

	const [session, api] = await Promise.all([
		auth.api.getSession({ headers: await headers() }),
		trpc(),
	]);

	let user;
	try {
		user = await api.user.getById({ id });
	} catch {
		notFound();
	}

	const isOwnProfile = session?.user.id === id;

	return (
		<div className="space-y-8">
			<div className="flex items-start gap-5">
				<UserAvatar name={user.name ?? "?"} image={user.image} size="xl" />
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="font-display text-2xl font-semibold tracking-tight">
							{user.name}
						</h1>
					</div>
					<Suspense
						fallback={
							<div className="mt-2 flex gap-4">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-4 w-20" />
							</div>
						}
					>
						<UserStats
							userId={id}
							isOwnProfile={isOwnProfile}
							hasSession={Boolean(session)}
							followerCount={user.followerCount}
							followingCount={user.followingCount}
						/>
					</Suspense>
					{!isOwnProfile && session && (
						<div className="mt-4">
							<FollowButton userId={id} isFollowing={user.isFollowing} />
						</div>
					)}
				</div>
				<div className="flex shrink-0 gap-1">
					<ShareButton
						title={`${user.name} on Miru`}
						text={`Check out ${user.name}'s profile on Miru`}
						variant="ghost"
					/>
					{isOwnProfile && (
						<Button
							variant="ghost"
							size="icon"
							asChild
							className="text-muted-foreground"
						>
							<Link href="/settings" aria-label="Settings">
								<Settings className="size-5" />
							</Link>
						</Button>
					)}
				</div>
			</div>

			{!isOwnProfile && session && (
				<Suspense fallback={<MatchesSkeleton />}>
					<UserMatches userId={id} />
				</Suspense>
			)}

			<Suspense fallback={<MovieSectionSkeleton title="Watchlist" />}>
				<UserMovieTabs
					userId={id}
					isOwnProfile={isOwnProfile}
					userName={user.name}
				/>
			</Suspense>
		</div>
	);
}

async function UserStats({
	userId,
	isOwnProfile,
	hasSession,
	followerCount,
	followingCount,
}: {
	userId: string;
	isOwnProfile: boolean;
	hasSession: boolean;
	followerCount: number;
	followingCount: number;
}) {
	const api = await trpc();

	let matchCount = 0;
	if (hasSession && !isOwnProfile) {
		const matches = await api.social.getMatchesWith({ friendId: userId });
		matchCount = matches.length;
	}

	return (
		<div className="mt-2 flex gap-4 text-sm text-muted-foreground">
			{!isOwnProfile && matchCount > 0 && (
				<span>
					<strong className="text-foreground">{matchCount}</strong> matches
				</span>
			)}
			<FollowersDialog
				userId={userId}
				followerCount={followerCount}
				followingCount={followingCount}
			/>
		</div>
	);
}

async function UserMatches({ userId }: { userId: string }) {
	const api = await trpc();
	const matches = await api.social.getMatchesWith({ friendId: userId });

	if (matches.length === 0) {
		return null;
	}

	return (
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
	);
}

async function UserMovieTabs({
	userId,
	isOwnProfile,
	userName,
}: {
	userId: string;
	isOwnProfile: boolean;
	userName: string | null;
}) {
	const api = await trpc();
	const [watchlist, watched] = await Promise.all([
		api.watchlist.getUserWatchlist({ limit: 30, userId }),
		api.watched.getUserWatched({ limit: 30, userId }),
	]);

	const firstName = userName?.split(" ")[0];

	return (
		<ProfileTabs
			watchlist={watchlist.map((m) => ({
				id: m.id,
				posterPath: m.posterPath,
				title: m.title,
			}))}
			watched={watched.map((m) => ({
				id: m.id,
				posterPath: m.posterPath,
				title: m.title,
			}))}
			watchlistLabel={isOwnProfile ? "Watchlist" : `${firstName}'s Watchlist`}
			watchedLabel={isOwnProfile ? "Watched" : `${firstName}'s Watched`}
		/>
	);
}

function MatchesSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-6 w-24" />
			<MovieGridSkeleton count={6} />
		</div>
	);
}

function MovieSectionSkeleton({ title }: { title: string }) {
	return (
		<div className="space-y-4">
			<h2 className="font-display text-lg font-semibold">{title}</h2>
			<MovieGridSkeleton count={10} />
		</div>
	);
}
