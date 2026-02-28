import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { UserPlus, UserMinus } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

interface FollowButtonProps {
	userId: string;
	isFollowing: boolean;
}

export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
	const utils = trpc.useUtils();
	const { data: session } = useSession();

	function invalidate() {
		utils.user.getById.invalidate({ id: userId });
		if (session?.user?.id) {
			utils.user.getById.invalidate({ id: session.user.id });
		}
		utils.social.getFollowers.invalidate();
		utils.social.getFollowing.invalidate();
		utils.social.searchUsers.invalidate();
		utils.social.getDashboardMatches.invalidate();
	}

	const follow = trpc.social.follow.useMutation({ onSuccess: invalidate });
	const unfollow = trpc.social.unfollow.useMutation({ onSuccess: invalidate });

	const loading = follow.isPending || unfollow.isPending;

	function handlePress() {
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
			disabled={loading}
		>
			{loading ? (
				<ActivityIndicator size="small" color={iconColor} />
			) : (
				<>
					<Icon size={14} color={iconColor} />
					<Text
						style={[
							styles.text,
							isFollowing ? styles.followingText : styles.notFollowingText,
						]}
					>
						{isFollowing ? "Following" : "Follow"}
					</Text>
				</>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		paddingHorizontal: spacing[5],
		paddingVertical: spacing[2],
		borderRadius: radius.full,
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
