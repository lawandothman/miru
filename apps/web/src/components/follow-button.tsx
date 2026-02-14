"use client";

import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { useRouter } from "next/navigation";
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
	const router = useRouter();
	const utils = trpc.useUtils();

	const onSuccess = () => {
		utils.social.invalidate();
		utils.user.getById.invalidate({ id: userId });
		router.refresh();
	};

	const follow = trpc.social.follow.useMutation({
		onSuccess,
		onError: () => toast.error("Failed to follow user"),
	});
	const unfollow = trpc.social.unfollow.useMutation({
		onSuccess,
		onError: () => toast.error("Failed to unfollow user"),
	});

	const isLoading = follow.isPending || unfollow.isPending;

	return (
		<Button
			type="button"
			onClick={() =>
				isFollowing
					? unfollow.mutate({ friendId: userId })
					: follow.mutate({ friendId: userId })
			}
			disabled={isLoading}
			variant={isFollowing ? "outline" : "default"}
			size="sm"
			className={cn("gap-1.5", className)}
		>
			{isLoading && <Loader2 className="size-3.5 animate-spin" />}
			{!isLoading && isFollowing && <UserMinus className="size-3.5" />}
			{!isLoading && !isFollowing && <UserPlus className="size-3.5" />}
			{isFollowing ? "Unfollow" : "Follow"}
		</Button>
	);
}
