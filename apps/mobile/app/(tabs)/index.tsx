import { useRouter } from "expo-router";
import { Bell, Film } from "lucide-react-native";
import { useState } from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/empty-state";
import { MoviePoster } from "@/components/movie-poster";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/lib/auth";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { triggerRefreshHaptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) {
		return "Good morning";
	}
	if (hour < 18) {
		return "Good afternoon";
	}
	return "Good evening";
}

export default function HomeScreen() {
	const { data: session } = useSession();
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const firstName = session?.user?.name?.split(" ")[0] ?? "";

	const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery();

	const {
		data: matches,
		isLoading,
		refetch,
	} = trpc.social.getDashboardMatches.useQuery();

	async function handleRefresh() {
		triggerRefreshHaptic();
		setRefreshing(true);
		try {
			await refetch();
		} finally {
			setRefreshing(false);
		}
	}

	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ScrollView
				contentContainerStyle={[
					styles.scroll,
					{ paddingBottom: spacing[8] + insets.bottom },
				]}
				alwaysBounceVertical={matches !== undefined && matches.length > 0}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={Colors.mutedForeground}
					/>
				}
			>
				<View style={styles.header}>
					<Text style={styles.greeting}>
						{getGreeting()}, {firstName}
					</Text>
					<Pressable
						onPress={() => router.push("/notifications")}
						accessibilityRole="button"
						accessibilityLabel="Notifications"
						style={styles.bellButton}
					>
						<Bell size={24} color={Colors.foreground} />
						{(unreadCount?.count ?? 0) > 0 && <View style={styles.badge} />}
					</Pressable>
				</View>

				{!isLoading && (!matches || matches.length === 0) ? (
					<EmptyState
						icon={Film}
						title="No matches yet"
						description="Follow friends and add movies to your watchlist to see what you can watch together."
						actionLabel="Discover movies"
						onAction={() => router.push("/(tabs)/discover")}
					/>
				) : (
					<View style={styles.matchList}>
						{matches?.map((friend) => (
							<Pressable
								key={friend.id}
								style={styles.friendCard}
								onPress={() => router.push(`/user/${friend.id}`)}
								accessibilityRole="button"
								accessibilityLabel={`${friend.name}, ${friend.matches.length} match${friend.matches.length !== 1 ? "es" : ""}`}
							>
								<View style={styles.friendHeader}>
									<UserAvatar
										imageUrl={friend.image}
										name={friend.name}
										size={44}
									/>
									<View>
										<Text style={styles.friendName}>{friend.name}</Text>
										<Text style={styles.matchCount}>
											{friend.matches.length} match
											{friend.matches.length !== 1 ? "es" : ""}
										</Text>
									</View>
								</View>

								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={styles.posterRow}
								>
									{friend.matches.map((m) => (
										<MoviePoster
											key={m.id}
											id={m.id}
											posterPath={m.posterPath}
											title={m.title}
											width={100}
											height={150}
										/>
									))}
								</ScrollView>
							</Pressable>
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scroll: {
		flexGrow: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing[4],
		paddingTop: spacing[4],
		paddingBottom: spacing[6],
	},
	greeting: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
		flex: 1,
	},
	bellButton: {
		padding: spacing[2],
	},
	badge: {
		position: "absolute",
		top: 6,
		right: 6,
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: Colors.destructive,
		borderWidth: 2,
		borderColor: Colors.background,
	},
	matchList: {
		gap: spacing[6],
		paddingHorizontal: spacing[4],
	},
	friendCard: {
		backgroundColor: Colors.card,
		borderRadius: radius.xl,
		padding: spacing[4],
		gap: spacing[4],
	},
	friendHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[4],
	},
	friendName: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
	},
	matchCount: {
		fontSize: fontSize.xs,
		color: Colors.mutedForeground,
	},
	posterRow: {
		gap: spacing[3],
	},
});
