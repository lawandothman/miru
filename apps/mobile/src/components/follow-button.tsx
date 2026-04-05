import { Pressable, Text, StyleSheet } from "react-native";
import { UserPlus, UserMinus } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { capture } from "@/lib/analytics";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { triggerFollowHaptic } from "@/lib/haptics";

interface FollowButtonProps {
	userId: string;
	isFollowing: boolean;
}

export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
	const utils = trpc.useUtils();
	const { data: session } = useSession();

	const queryKey = { id: userId };

	function invalidate() {
		utils.user.getById.invalidate(queryKey);
		if (session?.user?.id) {
			utils.user.getById.invalidate({ id: session.user.id });
		}
		utils.social.getFollowers.invalidate();
		utils.social.getFollowing.invalidate();
		utils.social.searchUsers.invalidate();
		utils.social.getDashboardMatches.invalidate();
	}

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
		},
		onSettled: invalidate,
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
		},
		onSettled: invalidate,
	});

	const isPending = follow.isPending || unfollow.isPending;

	function handlePress() {
		triggerFollowHaptic();

		if (isFollowing) {
			unfollow.mutate({ friendId: userId });
		} else {
			follow.mutate({ friendId: userId });
		}
	}

	const Icon = isFollowing ? UserMinus : UserPlus;
	const iconColor = isFollowing ? Colors.foreground : Colors.primaryForeground;

	return (
		<Pressable
			style={({ pressed }) => [
				styles.button,
				isFollowing ? styles.following : styles.notFollowing,
				pressed && styles.pressed,
			]}
			onPress={handlePress}
			disabled={isPending}
		>
			<Icon size={14} color={iconColor} />
			<Text
				style={[
					styles.text,
					isFollowing ? styles.followingText : styles.notFollowingText,
				]}
			>
				{isFollowing ? "Following" : "Follow"}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		paddingHorizontal: spacing[5],
		paddingVertical: spacing[2],
		borderRadius: radius.lg,
		alignItems: "center",
		justifyContent: "center",
		gap: spacing[1.5],
		minWidth: 100,
	},
	notFollowing: {
		backgroundColor: Colors.primary,
	},
	following: {
		backgroundColor: Colors.secondary,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	pressed: {
		opacity: 0.8,
	},
	text: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansSemibold,
	},
	notFollowingText: {
		color: Colors.primaryForeground,
	},
	followingText: {
		color: Colors.foreground,
	},
});
