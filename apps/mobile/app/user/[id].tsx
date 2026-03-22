import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	Alert,
	Pressable,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ellipsis } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { capture } from "@/lib/analytics";
import { UserAvatar } from "@/components/user-avatar";
import { UserStats } from "@/components/user-stats";
import { FollowButton } from "@/components/follow-button";
import { MovieCarousel } from "@/components/movie-carousel";
import { LoadingScreen } from "@/components/loading-screen";
import { defaultHeaderOptions } from "@/lib/navigation";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

export default function UserProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: session } = useSession();
	const isOwnProfile = session?.user?.id === id;

	const userId = id ?? "";

	const tracked = useRef(false);
	useEffect(() => {
		if (!isOwnProfile && userId && !tracked.current) {
			tracked.current = true;
			capture("match_viewed", { target_user_id: userId });
		}
	}, [isOwnProfile, userId]);

	const { data: profile, isLoading } = trpc.user.getById.useQuery(
		{ id: userId },
		{ enabled: Boolean(id) },
	);

	const { data: watchlist } = trpc.watchlist.getUserWatchlist.useQuery(
		{ userId, limit: 15 },
		{ enabled: Boolean(id) },
	);

	const { data: watched } = trpc.watched.getUserWatched.useQuery(
		{ userId, limit: 15 },
		{ enabled: Boolean(id) },
	);

	const { data: matches } = trpc.social.getMatchesWith.useQuery(
		{ friendId: userId },
		{ enabled: Boolean(id) && !isOwnProfile },
	);

	const utils = trpc.useUtils();
	const blockUser = trpc.social.block.useMutation({
		onSuccess: () => {
			utils.user.getById.invalidate({ id: userId });
			utils.social.getDashboardMatches.invalidate();
		},
	});
	const unblockUser = trpc.social.unblock.useMutation({
		onSuccess: () => {
			utils.user.getById.invalidate({ id: userId });
		},
	});

	function handleBlockPress() {
		if (!profile) {
			return;
		}

		if (profile.isBlocked) {
			unblockUser.mutate({ userId });
			return;
		}

		Alert.alert(
			`Block ${profile.name ?? "this user"}?`,
			"They won't be able to find your profile or see your watchlist. You will also unfollow each other.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Block",
					style: "destructive",
					onPress: () => blockUser.mutate({ userId }),
				},
			],
		);
	}

	if (isLoading || !profile) {
		return (
			<>
				<Stack.Screen options={{ ...defaultHeaderOptions, title: "" }} />
				<LoadingScreen />
			</>
		);
	}

	return (
		<>
			<Stack.Screen
				options={{
					...defaultHeaderOptions,
					title: profile.name ?? "",
					headerRight: !isOwnProfile
						? () => (
								<Pressable onPress={handleBlockPress} hitSlop={8}>
									<Ellipsis size={20} color={Colors.foreground} />
								</Pressable>
							)
						: undefined,
				}}
			/>
			<SafeAreaView style={styles.container} edges={[]}>
				<ScrollView contentContainerStyle={styles.scroll}>
					<View style={styles.header}>
						<UserAvatar
							imageUrl={profile.image}
							name={profile.name}
							size={80}
						/>
						<Text style={styles.name}>{profile.name}</Text>

						<UserStats
							userId={userId}
							followerCount={profile.followerCount}
							followingCount={profile.followingCount}
						/>

						{!isOwnProfile && !profile.isBlocked && (
							<FollowButton userId={userId} isFollowing={profile.isFollowing} />
						)}

						{profile.isBlocked && (
							<Text style={styles.blockedText}>You blocked this user</Text>
						)}
					</View>

					{!profile.isBlocked && matches && (
						<MovieCarousel title="Matches" movies={matches} />
					)}

					{!profile.isBlocked && watchlist && (
						<MovieCarousel title="Watchlist" movies={watchlist} />
					)}

					{!profile.isBlocked && watched && (
						<MovieCarousel title="Watched" movies={watched} />
					)}
				</ScrollView>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scroll: {
		paddingBottom: spacing[8],
		gap: spacing[6],
	},
	header: {
		alignItems: "center",
		paddingTop: spacing[6],
		gap: spacing[3],
	},
	name: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
	},
	blockedText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
});
