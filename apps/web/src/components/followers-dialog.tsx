"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";

type Mode = "followers" | "following";

interface FollowersDialogProps {
	userId: string;
	followerCount: number;
	followingCount: number;
}

export function FollowersDialog({
	userId,
	followerCount,
	followingCount,
}: FollowersDialogProps) {
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<Mode>("followers");
	const isMobile = useIsMobile();

	useEffect(() => {
		setOpen(false);
	}, [isMobile]);

	const openWith = (m: Mode) => {
		setMode(m);
		setOpen(true);
	};

	const title = mode === "followers" ? "Followers" : "Following";
	const content = <UserList userId={userId} mode={mode} />;

	return (
		<>
			<button
				type="button"
				onClick={() => openWith("followers")}
				className="hover:text-foreground transition-colors"
			>
				<strong className="text-foreground">{followerCount}</strong> followers
			</button>
			<button
				type="button"
				onClick={() => openWith("following")}
				className="hover:text-foreground transition-colors"
			>
				<strong className="text-foreground">{followingCount}</strong> following
			</button>

			{isMobile && (
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent className="inset-x-0 bottom-0 mt-10 min-h-[85vh] max-h-[96vh] rounded-t-lg border-t">
						<DrawerHeader>
							<DrawerTitle>{title}</DrawerTitle>
							<DrawerDescription className="sr-only">
								View {title.toLowerCase()}
							</DrawerDescription>
						</DrawerHeader>
						<div className="flex-1 overflow-y-auto px-4 pb-4">{content}</div>
					</DrawerContent>
				</Drawer>
			)}

			{!isMobile && (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent showCloseButton>
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
							<DialogDescription className="sr-only">
								View {title.toLowerCase()}
							</DialogDescription>
						</DialogHeader>
						{content}
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}

function UserList({ userId, mode }: { userId: string; mode: Mode }) {
	const { data: session } = useSession();
	const currentUserId = session?.user?.id;
	const followers = trpc.social.getFollowers.useQuery(
		{ userId },
		{ enabled: mode === "followers" },
	);
	const following = trpc.social.getFollowing.useQuery(
		{ userId },
		{ enabled: mode === "following" },
	);

	const data = mode === "followers" ? followers : following;
	const users = data.data ?? [];

	return (
		<div className="overflow-y-auto">
			{data.isLoading ? (
				<div className="space-y-3">
					{Array.from(
						{ length: 4 },
						(_, i) => `follower-skeleton-${i + 1}`,
					).map((skeletonId) => (
						<div key={skeletonId} className="flex items-center gap-3">
							<Skeleton className="size-8 rounded-full" />
							<Skeleton className="h-4 w-28" />
							<Skeleton className="ml-auto h-8 w-20" />
						</div>
					))}
				</div>
			) : users.length === 0 ? (
				<p className="py-8 text-center text-sm text-muted-foreground">
					{mode === "followers"
						? "No followers yet"
						: "Not following anyone yet"}
				</p>
			) : (
				<div className="space-y-4">
					{users.map((user) => (
						<div key={user.id} className="flex items-center gap-3 py-1">
							<Link
								href={`/user/${user.id}`}
								className="flex min-w-0 flex-1 items-center gap-3"
							>
								<UserAvatar
									name={user.name ?? "?"}
									image={user.image}
									size="sm"
								/>
								<span className="truncate text-sm font-medium">
									{user.name}
								</span>
							</Link>
							{user.id !== currentUserId && (
								<FollowButton userId={user.id} isFollowing={user.isFollowing} />
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
