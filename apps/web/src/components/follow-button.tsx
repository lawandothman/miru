"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { capture } from "@/lib/analytics";

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
	const router = useRouter();
	const utils = trpc.useUtils();

	const queryKey = { id: userId };

	const follow = trpc.social.follow.useMutation({
		onMutate: async () => {
			await utils.user.getById.cancel(queryKey);
			const previous = utils.user.getById.getData(queryKey);
			utils.user.getById.setData(queryKey, (old) =>
				old
					? {
							...old,
							isFollowing: true,
							followerCount: old.followerCount + 1,
						}
					: old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("user_followed", { target_user_id: userId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.user.getById.setData(queryKey, context.previous);
			}
			toast.error("Failed to follow user");
		},
		onSettled: () => {
			utils.social.invalidate();
			utils.user.getById.invalidate(queryKey);
			router.refresh();
		},
	});

	const unfollow = trpc.social.unfollow.useMutation({
		onMutate: async () => {
			await utils.user.getById.cancel(queryKey);
			const previous = utils.user.getById.getData(queryKey);
			utils.user.getById.setData(queryKey, (old) =>
				old
					? {
							...old,
							isFollowing: false,
							followerCount: Math.max(0, old.followerCount - 1),
						}
					: old,
			);
			return { previous };
		},
		onSuccess: () => {
			capture("user_unfollowed", { target_user_id: userId });
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.user.getById.setData(queryKey, context.previous);
			}
			toast.error("Failed to unfollow user");
		},
		onSettled: () => {
			utils.social.invalidate();
			utils.user.getById.invalidate(queryKey);
			router.refresh();
		},
	});

	const isPending = follow.isPending || unfollow.isPending;

	return (
		<Button
			type="button"
			onClick={() =>
				isFollowing
					? unfollow.mutate({ friendId: userId })
					: follow.mutate({ friendId: userId })
			}
			disabled={isPending}
			variant={isFollowing ? "outline" : "default"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			{isFollowing ? (
				<UserMinus className="size-3.5" />
			) : (
				<UserPlus className="size-3.5" />
			)}
			{isFollowing ? "Unfollow" : "Follow"}
		</Button>
	);
}
