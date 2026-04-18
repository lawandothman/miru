import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	Alert,
	Share,
	type LayoutChangeEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useRef, useState } from "react";
import { Film } from "lucide-react-native";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
import { capture } from "@/lib/analytics";
import { UserAvatar } from "@/components/user-avatar";
import { UserStats } from "@/components/user-stats";
import { FollowButton } from "@/components/follow-button";
import { MovieCarousel } from "@/components/movie-carousel";
import { UserProfileSkeleton } from "@/components/user-profile-skeleton";
import { EmptyState } from "@/components/empty-state";
import { Spinner } from "@/components/spinner";
import { useDefaultHeaderOptions } from "@/lib/navigation";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

export default function UserProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: session } = useSession();
	const isOwnProfile = session?.user?.id === id;
	const userId = id ?? "";
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
	const canLoadMovies = Boolean(id) && (profile ? !profile.isBlocked : false);

	const watchlistQuery = trpc.watchlist.getUserWatchlist.useQuery(
		{ userId, limit: 15 },
		{ enabled: canLoadMovies },
	);

	const watchedQuery = trpc.watched.getUserWatched.useQuery(
		{ userId, limit: 15 },
		{ enabled: canLoadMovies },
	);

	const { data: matches, isLoading: matchesLoading } =
		trpc.social.getMatchesWith.useQuery(
			{ friendId: userId },
			{ enabled: canLoadMovies && !isOwnProfile },
		);

	const [showHeaderTitle, setShowHeaderTitle] = useState(false);
	const nameBottomRef = useRef(0);

	const handleNameLayout = useCallback((event: LayoutChangeEvent) => {
		const { y, height } = event.nativeEvent.layout;
		nameBottomRef.current = y + height;
	}, []);

	const handleScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const scrollY = event.nativeEvent.contentOffset.y;
			setShowHeaderTitle(scrollY > nameBottomRef.current);
		},
		[],
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

	const matchMovies = matches ?? [];
	const watchlistMovies = watchlistQuery.data ?? [];
	const watchedMovies = watchedQuery.data ?? [];
	const isSectionLoading =
		!profile.isBlocked &&
		(watchlistQuery.isLoading ||
			watchedQuery.isLoading ||
			(!isOwnProfile && matchesLoading));
	const hasSections =
		matchMovies.length > 0 ||
		watchlistMovies.length > 0 ||
		watchedMovies.length > 0;

	return (
		<>
			<Stack.Screen
				options={{
					...headerOptions,
					title: showHeaderTitle ? (profile.name ?? "") : "",
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

			<SafeAreaView style={styles.container} edges={[]}>
				<ScrollView
					contentContainerStyle={styles.scroll}
					onScroll={handleScroll}
					scrollEventThrottle={16}
				>
					<View style={styles.header}>
						<UserAvatar
							imageUrl={profile.image}
							name={profile.name}
							size={80}
						/>
						<Text style={styles.name} onLayout={handleNameLayout}>
							{profile.name}
						</Text>
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

					{!profile.isBlocked && matchMovies.length > 0 && (
						<MovieCarousel title="Matches" movies={matchMovies} />
					)}

					{!profile.isBlocked && watchlistMovies.length > 0 && (
						<MovieCarousel title="Watchlist" movies={watchlistMovies} />
					)}

					{!profile.isBlocked && watchedMovies.length > 0 && (
						<MovieCarousel title="Watched" movies={watchedMovies} />
					)}

					{!profile.isBlocked && isSectionLoading && !hasSections && (
						<View style={styles.loadingState}>
							<Spinner />
						</View>
					)}

					{!profile.isBlocked && !isSectionLoading && !hasSections && (
						<EmptyState
							icon={Film}
							title="No movies here yet"
							description="This user hasn't added any matches, watchlist titles, or watched movies yet."
						/>
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
	loadingState: {
		paddingVertical: spacing[8],
		alignItems: "center",
	},
});
