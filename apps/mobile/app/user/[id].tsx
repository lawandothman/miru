import { View, Text, StyleSheet, Alert, Share, Pressable } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { capture } from "@/lib/analytics";
import { UserAvatar } from "@/components/user-avatar";
import { UserStats } from "@/components/user-stats";
import { FollowButton } from "@/components/follow-button";
import { MovieGrid } from "@/components/movie-grid";
import { MovieCarousel } from "@/components/movie-carousel";
import { UserProfileSkeleton } from "@/components/user-profile-skeleton";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

type Tab = "watchlist" | "watched";

export default function UserProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: session } = useSession();
	const isOwnProfile = session?.user?.id === id;
	const userId = id ?? "";
	const [activeTab, setActiveTab] = useState<Tab>("watchlist");
	const headerOptions = useDefaultHeaderOptions();

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

	const watchlistQuery = trpc.watchlist.getUserWatchlist.useQuery(
		{ userId, limit: 60 },
		{ enabled: Boolean(id) },
	);

	const watchedQuery = trpc.watched.getUserWatched.useQuery(
		{ userId, limit: 60 },
		{ enabled: Boolean(id) },
	);

	const { data: matches } = trpc.social.getMatchesWith.useQuery(
		{ friendId: userId },
		{ enabled: Boolean(id) && !isOwnProfile },
	);

	const utils = trpc.useUtils();
	const queryKey = { id: userId };

	const blockUser = trpc.social.block.useMutation({
		onMutate: async () => {
			await utils.user.getById.cancel(queryKey);
			const previous = utils.user.getById.getData(queryKey);
			utils.user.getById.setData(queryKey, (old) =>
				old ? { ...old, isBlocked: true, isFollowing: false } : old,
			);
			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.user.getById.setData(queryKey, context.previous);
			}
		},
		onSettled: () => {
			utils.user.getById.invalidate(queryKey);
			utils.social.getDashboardMatches.invalidate();
		},
	});
	const unblockUser = trpc.social.unblock.useMutation({
		onMutate: async () => {
			await utils.user.getById.cancel(queryKey);
			const previous = utils.user.getById.getData(queryKey);
			utils.user.getById.setData(queryKey, (old) =>
				old ? { ...old, isBlocked: false } : old,
			);
			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				utils.user.getById.setData(queryKey, context.previous);
			}
		},
		onSettled: () => {
			utils.user.getById.invalidate(queryKey);
		},
	});

	function handleBlockPress() {
		if (!profile) {
			return;
		}

		if (profile.isBlocked) {
			Alert.alert(
				`Unblock ${profile.name ?? "this user"}?`,
				"They'll be able to see your profile and watchlist again.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Unblock",
						onPress: () => unblockUser.mutate({ userId }),
					},
				],
			);
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

	function handleShare() {
		if (!profile) {
			return;
		}
		Share.share({
			message: `Check out ${profile.name ?? "this user"} on Miru!`,
		});
	}

	if (isLoading || !profile) {
		return (
			<>
				<Stack.Screen options={{ ...headerOptions, title: "" }} />
				<UserProfileSkeleton />
			</>
		);
	}

	const activeQuery = activeTab === "watchlist" ? watchlistQuery : watchedQuery;
	const movies = activeQuery.data ?? [];

	return (
		<>
			<Stack.Screen
				options={{
					...headerOptions,
					title: profile.name ?? "",
				}}
			/>

			{!isOwnProfile && (
				<Stack.Toolbar placement="right">
					<Stack.Toolbar.Menu icon="ellipsis">
						<Stack.Toolbar.MenuAction
							icon="square.and.arrow.up"
							onPress={handleShare}
						>
							Share Profile
						</Stack.Toolbar.MenuAction>
						<Stack.Toolbar.MenuAction
							icon={profile.isBlocked ? "checkmark.shield" : "hand.raised"}
							destructive={!profile.isBlocked}
							onPress={handleBlockPress}
						>
							{profile.isBlocked ? "Unblock" : "Block"}
						</Stack.Toolbar.MenuAction>
					</Stack.Toolbar.Menu>
				</Stack.Toolbar>
			)}

			<View style={styles.container}>
				<MovieGrid
					movies={profile.isBlocked ? [] : movies}
					isLoading={!profile.isBlocked && activeQuery.isLoading}
					onRefresh={() => activeQuery.refetch()}
					ListHeaderComponent={
						<View style={styles.headerWrapper}>
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
									<FollowButton
										userId={userId}
										isFollowing={profile.isFollowing}
									/>
								)}
								{profile.isBlocked && (
									<Text style={styles.blockedText}>You blocked this user</Text>
								)}
							</View>

							{!profile.isBlocked && matches && matches.length > 0 && (
								<MovieCarousel title="Matches" movies={matches} />
							)}

							{!profile.isBlocked && (
								<View style={styles.tabs} accessibilityRole="tablist">
									<Pressable
										style={[
											styles.tab,
											activeTab === "watchlist" && styles.tabActive,
										]}
										onPress={() => setActiveTab("watchlist")}
										accessibilityRole="tab"
										accessibilityLabel="Watchlist"
										accessibilityState={{ selected: activeTab === "watchlist" }}
									>
										<Text
											style={[
												styles.tabText,
												activeTab === "watchlist" && styles.tabTextActive,
											]}
										>
											Watchlist
										</Text>
									</Pressable>
									<Pressable
										style={[
											styles.tab,
											activeTab === "watched" && styles.tabActive,
										]}
										onPress={() => setActiveTab("watched")}
										accessibilityRole="tab"
										accessibilityLabel="Watched"
										accessibilityState={{ selected: activeTab === "watched" }}
									>
										<Text
											style={[
												styles.tabText,
												activeTab === "watched" && styles.tabTextActive,
											]}
										>
											Watched
										</Text>
									</Pressable>
								</View>
							)}
						</View>
					}
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	headerWrapper: {
		gap: spacing[6],
		paddingTop: spacing[6],
		paddingBottom: spacing[4],
	},
	header: {
		alignItems: "center",
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
	tabs: {
		flexDirection: "row",
		marginHorizontal: spacing[4],
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		padding: 4,
	},
	tab: {
		flex: 1,
		paddingVertical: spacing[2],
		alignItems: "center",
		borderRadius: radius.md,
	},
	tabActive: {
		backgroundColor: Colors.background,
	},
	tabText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
	},
	tabTextActive: {
		color: Colors.foreground,
		fontFamily: fontFamily.sansSemibold,
	},
});
