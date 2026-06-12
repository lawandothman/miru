"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { capture } from "@/lib/analytics";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
	userId: string;
	isFollowing: boolean;
	className?: string;
}

export function FollowButton({
	userId,
	isFollowing,
	className,
}: FollowButtonProps) {
	const utils = trpc.useUtils();
	const [following, setFollowing] = useState(isFollowing);

	// Following touches follower/following lists, dashboard matches, and the
	// target's follower count. Invalidate those so they refetch on next view;
	// the button itself flips instantly from local state.
	const invalidate = () => {
		void utils.social.invalidate();
		void utils.user.getById.invalidate({ id: userId });
	};

	const follow = trpc.social.follow.useMutation({
		onMutate: () => setFollowing(true),
		onSuccess: () => capture("user_followed", { target_user_id: userId }),
		onError: () => {
			setFollowing(false);
			toast.error("Failed to follow user");
		},
		onSettled: invalidate,
	});

	const unfollow = trpc.social.unfollow.useMutation({
		onMutate: () => setFollowing(false),
		onSuccess: () => capture("user_unfollowed", { target_user_id: userId }),
		onError: () => {
			setFollowing(true);
			toast.error("Failed to unfollow user");
		},
		onSettled: invalidate,
	});

	const isPending = follow.isPending || unfollow.isPending;

	return (
		<Button
			type="button"
			onClick={() =>
				following
					? unfollow.mutate({ friendId: userId })
					: follow.mutate({ friendId: userId })
			}
			disabled={isPending}
			variant={following ? "outline" : "default"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			{following ? (
				<UserMinus className="size-3.5" />
			) : (
				<UserPlus className="size-3.5" />
			)}
			{following ? "Unfollow" : "Follow"}
		</Button>
	);
}
