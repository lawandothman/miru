import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth";
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
							followerCount={profile.followerCount}
							followingCount={profile.followingCount}
						/>

						{!isOwnProfile && (
							<FollowButton userId={userId} isFollowing={profile.isFollowing} />
						)}
					</View>

					{matches && <MovieCarousel title="Matches" movies={matches} />}

					{watchlist && <MovieCarousel title="Watchlist" movies={watchlist} />}

					{watched && <MovieCarousel title="Watched" movies={watched} />}
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
});
